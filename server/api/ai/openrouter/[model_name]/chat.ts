import type { Actor } from '~/lib/types/database.tables/schema'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { streamText } from 'ai'
import { createError } from 'h3'
import { POSSIBLE_AI_MODELS } from '~/lib/data/ai.models'
import { ChatConversationMessagesToCreateSchema } from '~/lib/types/database.tables/schema'
import { persistAiChatMessage, persistUserChatMessage } from '~/server/utils/chat'
import { validateParamAiModelName, validateQueryChatId } from '~/server/utils/validate'

export default defineEventHandler(async (event) => {
  if (LOG_BACKEND) {
    console.info('OpenRouter chat endpoint called')
  }

  /* 0. VALIDATE METHOD */
  assertMethod(event, ['POST'])
  const user = event.context.user

  /* VALIDATE QUERY */
  const maybeChatId = await validateQueryChatId(event)
  if (maybeChatId.statusCode !== 200) {
    if (LOG_BACKEND) {
      console.error('Chat ID validation failed:', maybeChatId)
    }
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
    if (LOG_BACKEND) {
      console.error('Model name validation failed:', maybeModelName)
    }
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

  if (!model_name || !POSSIBLE_AI_MODELS.openrouter?.[model_name]) {
    if (LOG_BACKEND) {
      console.error('Invalid model configuration:', { model_name, available_models: Object.keys(POSSIBLE_AI_MODELS.openrouter || {}) })
    }
    throw createError({
      statusCode: 400,
      message: `Invalid model: ${model_name}`,
    })
  }

  const modelConfig = POSSIBLE_AI_MODELS.openrouter[model_name]
  if (LOG_BACKEND) {
    console.info('Using model config:', { model_name, type: modelConfig.type, publisher: modelConfig.publisher })
  }

  const body = await readValidatedBody(event, (body) => {
    return ChatConversationMessagesToCreateSchema.safeParse(body)
  })
  if (!body.success || !body.data) {
    if (LOG_BACKEND) {
      console.error('Body validation failed:', body.error)
    }
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

  if (LOG_BACKEND) {
    console.info('Processing messages:', messages.map(m => ({ role: m.role, contentLength: m.content.length })))
  }

  const SYSTEM_MESSAGE = 'You have to answer all my questions and provide all information using Markdown syntax. This includes formatting text, adding lists, inserting links, using code blocks, and any other Markdown features that are appropriate for your responses.'
  if (!messages.some(message => message.content === SYSTEM_MESSAGE) && model_name !== 'gemini-2.0-pro-exp-02-05') {
    if (LOG_BACKEND) {
      console.info('Adding system message')
    }
    messages.unshift({
      role: 'user' as Actor,
      content: SYSTEM_MESSAGE,
    })
  }

  const userMessage = messages[messages.length - 1]
  // always persist user message if we have a valid chat_id and are not in playground mode
  if (chat_id !== -1 && !is_playground) {
    if (LOG_BACKEND) {
      console.info('Persisting user message:', { user_id: user.id, chat_id, contentLength: userMessage.content.length })
    }
    await persistUserChatMessage(user.id, chat_id, userMessage.content, event)
  }

  try {
    const config = modelConfig.configuration('')
    if (LOG_BACKEND) {
      console.info('Model configuration:', {
        model: config.model,
        parameters: config.parameters,
      })
    }

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      throw createError({
        statusCode: 500,
        message: 'OPENROUTER_API_KEY is not configured',
      })
    }

    const openrouter = createOpenRouter({
      apiKey,
    })

    const result = streamText({
      model: openrouter(config.model),
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      async onFinish(completion) {
        if (LOG_BACKEND) {
          console.info('Stream completed:', {
            responseLength: completion.text.length,
            firstChars: `${completion.text.substring(0, 50)}...`,
          })
        }
        // persist the complete message if we have a valid chat_id and are not in playground mode
        if (chat_id !== -1 && !is_playground) {
          if (LOG_BACKEND) {
            console.info('Persisting AI message:', { user_id: user.id, chat_id, contentLength: completion.text.length })
          }
          const result = await persistAiChatMessage(user.id, chat_id, completion.text, event)
          if (LOG_BACKEND) {
            console.info('Persistence result:', result)
          }
        }
      },
    })

    if (LOG_BACKEND) {
      console.info('Stream started, returning response')
    }

    // consume the stream to ensure it runs to completion & triggers onFinish
    // even when the client response is aborted:
    // result.consumeStream();

    return result.toDataStreamResponse()
  } catch (error: unknown) {
    if (LOG_BACKEND) {
      console.error('OpenRouter request failed:', {
        error: error instanceof Error
          ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
            cause: error.cause,
          }
          : error,
        model: model_name,
        messageCount: messages.length,
      })
    }

    if (error instanceof Error) {
      return sendError(
        event,
        createError({
          statusCode: 500,
          statusMessage: error.message,
        }),
      )
    } else if (typeof error === 'object' && error !== null) {
      return sendError(
        event,
        createError({
          statusCode: 500,
          statusMessage: String((error as { message?: string }).message || 'Unknown error occurred'),
        }),
      )
    } else {
      return sendError(
        event,
        createError({
          statusCode: 500,
          statusMessage: 'An unexpected error occurred',
        }),
      )
    }
  }
})
