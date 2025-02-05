import type { Actor } from '~/lib/types/database.tables/schema'
import { HfInference } from '@huggingface/inference'
import { HuggingFaceStream, type Message, StreamingTextResponse } from 'ai'
import { POSSIBLE_AI_MODELS } from '~/lib/data/ai.models'
import { ChatConversationMessagesToCreateSchema } from '~/lib/types/database.tables/schema'
import {
  ALLOWED_AI_MODELS,
  AllowedAiModelNamesEnum,
  defaultAiModel,
  defaultAiModelProvider,
} from '~/lib/types/models/ai'
import {
  validateParamAiModelName,
  validateQueryChatId,
} from '~/server/utils/validate'
import { getSanitizedMessageContent } from '~/utils/chat'

export default defineLazyEventHandler(async () => {
  const apiKey = useRuntimeConfig().huggingfaceApiKey
  const Hf = new HfInference(apiKey)

  return defineEventHandler(async (event) => {
    /* 0. VALIDATE METHOD */
    assertMethod(event, ['POST'])
    const user = event.context.user

    /* VALIDATE QUERY */
    const maybeChatId = await validateQueryChatId(event)
    if (maybeChatId.statusCode !== 200) {
      return sendError(
        event,
        createError({
          statusCode: maybeChatId.statusCode,
          statusMessage: maybeChatId.statusMessage,
          data: maybeChatId.data,
        }),
      )
    }
    const chat_id = maybeChatId.data?.chat_id
    const is_playground = maybeChatId.data?.is_playground

    /* VALIDATE PARAMS */
    const maybeModelName = await validateParamAiModelName(event)
    if (maybeModelName.statusCode !== 200) {
      return sendError(
        event,
        createError({
          statusCode: maybeModelName.statusCode,
          statusMessage: maybeModelName.statusMessage,
          data: maybeModelName.data,
        }),
      )
    }
    const model_name = maybeModelName.data?.model_name
    const model_publisher = maybeModelName.data?.model_publisher

    if (LOG_BACKEND) {
      console.info(`Fetching model: ${model_publisher}/${model_name}...`)
    }

    const body = await readValidatedBody(event, (body) => {
      return ChatConversationMessagesToCreateSchema.safeParse(body)
    })
    if (!body.success || !body.data) {
      return sendError(
        event,
        createError({
          statusCode: 400,
          statusMessage: 'Bad Request. Invalid body(message | messages).',
          data: body.error,
        }),
      )
    }
    const validatedBody = body.data
    const { messages } = validatedBody

    const SYSTEM_MESSAGE
      = 'You have to answer all my questions and provide all information using Markdown syntax. This includes formatting text, adding lists, inserting links, using code blocks, and any other Markdown features that are appropriate for your responses.'
    if (!messages.some(message => message.content === SYSTEM_MESSAGE)) {
      if (LOG_BACKEND) {
        console.info(
          'No system message found. Adding initial system message...',
        )
      }

      // TODO: freshly add this every time the context is truncated
      messages.unshift({
        role: 'user' as Actor, // ERROR: AI request errored: OpenAssistant does not support system messages. => use user role instead
        content: SYSTEM_MESSAGE,
      })
    }

    const userMessage = messages[messages.length - 1] // { role: 'user', content: 'message' }
    // if (LOG_BACKEND) console.info("current user message", userMessage);
    if (!is_playground) {
      await persistUserChatMessage(user.id, chat_id, userMessage.content, event)
    }

    try {
      // if (LOG_BACKEND) console.info('allowed models:', ALLOWED_AI_MODELS);
      if (
        !model_name
        || !model_publisher
        || !ALLOWED_AI_MODELS.includes(`${model_publisher}/${model_name}`)
      ) {
        // if (LOG_BACKEND) console.warn(`Invalid model name or publisher: ${model_publisher}/${model_name}. Allowed are '${ALLOWED_AI_MODELS.join(', ')}'`);
        sendError(
          event,
          createError({
            statusCode: 400,
            statusMessage: 'Invalid model name- or publisher',
          }),
        )
      }

      let inputs = String(messages)
      const minimalMessages = messages as Pick<Message, 'content' | 'role'>[]

      // Sanitize messages before building prompt
      const sanitizedMessages = minimalMessages.map(msg => ({
        ...msg,
        content: getSanitizedMessageContent(msg.content),
      }))
      if (model_name === AllowedAiModelNamesEnum.Llama3) {
        inputs = buildMetaLlama3Prompt(sanitizedMessages)
      } else if (model_name === AllowedAiModelNamesEnum.Gemma) {
        inputs = buildGemma2Prompt(sanitizedMessages)
      } else if (model_name === AllowedAiModelNamesEnum.Phi3) {
        inputs = buildPhi3Prompt(sanitizedMessages)
      } else if (model_name === AllowedAiModelNamesEnum.QwenCoder
        || model_name === AllowedAiModelNamesEnum.Qwen72B) {
        inputs = buildQwen25Prompt(sanitizedMessages)
      } else if (model_name === AllowedAiModelNamesEnum.MistralNemo) {
        inputs = buildMistralNemoPrompt(sanitizedMessages)
      } else if (model_name === AllowedAiModelNamesEnum.Mistral7B) {
        inputs = buildMistral7BV3Prompt(sanitizedMessages)
      } else if (model_name === AllowedAiModelNamesEnum.DeepSeekR1) {
        inputs = buildQwen25Prompt(sanitizedMessages) // DeepSeek uses Qwen chat template
      }

      // if (LOG_BACKEND) console.info('---');
      // if (LOG_BACKEND) console.info('AI request:', inputs);
      // if (LOG_BACKEND) console.info('---');

      const response = Hf.textGenerationStream(
        POSSIBLE_AI_MODELS?.[model_publisher ?? defaultAiModelProvider]?.[
          model_name ?? defaultAiModel
        ]?.configuration(inputs),
      )

      // https://sdk.vercel.ai/docs/ai-sdk-ui/storing-messages
      const stream = HuggingFaceStream(response, {
        async onFinal(messageText: string) {
          // onCompletion, onFinal, onToken and onText is called for each token (word, punctuation)
          const messageContent = getSanitizedMessageContent(messageText)
          if (!is_playground) {
            await persistAiChatMessage(user.id, chat_id, messageContent, event)
          }
        },
      }) // Converts the response into a friendly text-stream

      return new StreamingTextResponse(stream) // Respond with the stream
    } catch (error) {
      if (LOG_BACKEND) {
        console.error('AI request errored:', error)
      }
      sendError(
        event,
        createError({
          statusCode: 500,
          statusMessage: 'Internal Server Error',
        }),
      )
    }
  })
})
