import type { Message } from 'ai'
import type { Actor } from '~/lib/types/database.tables/schema'
import { HfInference } from '@huggingface/inference'
import { POSSIBLE_AI_MODELS } from '~/lib/data/ai.models'
import { ChatConversationMessagesToCreateSchema } from '~/lib/types/database.tables/schema'
import {
  ALLOWED_AI_MODELS,
  AllowedAiModelNamesEnum,
  defaultAiModel,
  defaultAiModelProvider,
} from '~/lib/types/models/ai'
import { readProjectContext } from '~/server/database/repositories/projectContext'
import {
  isValidUser,
  validateParamAiModelName,
  validateQueryChatId,
} from '~/server/utils/validate'
import { getSanitizedMessageContent } from '~/utils/chat'

export default defineLazyEventHandler(async () => {
  const apiKey = useRuntimeConfig().huggingfaceApiKey as string
  const Hf = new HfInference(apiKey)

  return defineEventHandler(async (event) => {
    /* 0. VALIDATE METHOD */
    assertMethod(event, ['POST'])

    /* 1. VALIDATE USER */
    const user = event.context.user
    if (!isValidUser(user)) {
      throw createError({
        statusCode: 401,
        message: 'Invalid user session',
      })
    }

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

    let systemPrompt = null
    // Add project context if available
    if (chat_id !== -1 && !is_playground) {
      systemPrompt = JSON.stringify(await readProjectContext(user.id, chat_id))
    }

    const SYSTEM_MESSAGE = systemPrompt || 'You have to answer all my questions and provide all information using Markdown syntax. This includes formatting text, adding lists, inserting links, using code blocks, and any other Markdown features that are appropriate for your responses.'
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

    // always persist user message if we have a valid chat_id and are not in playground mode
    if (chat_id !== -1 && !is_playground) {
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
        return sendError(
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
      if (model_name === AllowedAiModelNamesEnum.Gemma) {
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

      const modelProvider = POSSIBLE_AI_MODELS[model_publisher ?? defaultAiModelProvider]
      if (!modelProvider) {
        throw createError({
          statusCode: 400,
          statusMessage: `Invalid model provider: ${model_publisher}`,
        })
      }

      const modelDefinition = modelProvider[model_name ?? defaultAiModel]
      if (!modelDefinition) {
        throw createError({
          statusCode: 400,
          statusMessage: `Invalid model name: ${model_name}`,
        })
      }

      const modelConfig = modelDefinition.configuration(inputs)
      if (!modelConfig || !modelConfig.model) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid model configuration',
        })
      }

      // Convert the response to a stream in the AI SDK format
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        async start(controller) {
          let accumulatedText = ''

          if (model_name === AllowedAiModelNamesEnum.DeepSeekR1) {
            // DeepSeek specific implementation with think tags and markdown handling
            let buffer = ''
            let tagBuffer = ''
            let isInTag = false
            let lastCleanedText = ''
            let isFirstChunk = true

            const sendChunk = (text: string) => {
              if (text && text !== lastCleanedText) {
                lastCleanedText = text
                accumulatedText += text
                controller.enqueue(encoder.encode(`0:${JSON.stringify(text)}\n`))
              }
            }

            const flushBuffer = () => {
              if (buffer) {
                const cleaned = getSanitizedMessageContent(buffer)
                if (cleaned !== lastCleanedText) {
                  sendChunk(cleaned)
                }
                buffer = ''
              }
            }

            try {
              const response = Hf.textGenerationStream({
                model: modelConfig.model,
                inputs: modelConfig.inputs,
                parameters: modelConfig.parameters,
              })

              // Process each chunk as it arrives
              for await (const chunk of response) {
                if (chunk.token.text) {
                  const token = chunk.token.text

                  // For DeepSeek, wrap first response in think tags
                  if (isFirstChunk && !token.includes('<think>')) {
                    tagBuffer = '<think>'
                    isInTag = true
                  }
                  isFirstChunk = false

                  // Check for tag boundaries
                  if (token.includes('</think>')) {
                    // Found end tag, make sure we have a start tag
                    if (!tagBuffer.includes('<think>')) {
                      tagBuffer = `<think>${tagBuffer}`
                    }
                    tagBuffer += token
                    const cleaned = getSanitizedMessageContent(tagBuffer)
                    sendChunk(cleaned)
                    tagBuffer = ''
                    isInTag = false
                    // Reset to allow new content
                    lastCleanedText = ''
                  } else if (token.includes('<think>')) {
                    // Start new tag
                    isInTag = true
                    flushBuffer()
                    tagBuffer = token
                  } else if (isInTag) {
                    // Inside tag, accumulate
                    tagBuffer += token
                  } else {
                    // Regular text
                    buffer += token

                    // Check if we're in the middle of any Markdown construct
                    const inMarkdown = (
                      // Headers (# until newline)
                      buffer.match(/^#+[^#\n]*$/)
                      // Lists (-, +, *, or 1. until newline)
                      || buffer.match(/^(\d+\.|[+*\-])\s[^\n]*$/)
                      // Blockquotes (can be nested with multiple >)
                      || buffer.match(/^>+\s[^\n]*$/)
                      // Code blocks (between ```)
                      || (buffer.includes('```') && !buffer.match(/```.*```/s))
                      // Inline code (between single `)
                      || (buffer.match(/`[^`]*$/) && !buffer.includes('```'))
                      // Tables (| until newline)
                      || (buffer.includes('|') && !buffer.endsWith('\n'))
                      // Links/Images ([...] without (...))
                      || (buffer.match(/!?\[[^\]]*\]/) && !buffer.match(/\]\([^)]*\)/))
                      // Reference-style links ([...][...])
                      || buffer.match(/\[[^\]]*\]\[[^\]]*$/)
                      // Link references ([...]: url)
                      || buffer.match(/^\[[^\]]*\]:\s*\S*$/)
                      // Emphasis/Bold (*, _, ~~ without closing)
                      || buffer.match(/(\*\*|\*|~~|_)[^*~_\n]*$/)
                      // Horizontal rules (-, _, * with at least 3)
                      || buffer.match(/^(-{1,2}|_{1,2}|\*{1,2})\s*$/)
                    )

                    // Only flush if we're not in the middle of a Markdown construct
                    // and we have a natural boundary
                    if (!inMarkdown && (
                      // Complete paragraph (double newline)
                      buffer.endsWith('\n\n')
                      // Complete sentence with proper punctuation, not in a URL
                      || (buffer.match(/[.!?]\s$/) && !buffer.match(/https?:\/\/\S*$/))
                    )) {
                      flushBuffer()
                    }
                  }
                }
              }

              // Handle any remaining buffers
              if (tagBuffer) {
                // If we have tag content but no start tag, add it
                if (!tagBuffer.includes('<think>')) {
                  tagBuffer = `<think>${tagBuffer}`
                }
                // If we have tag content but no end tag, add it
                if (!tagBuffer.includes('</think>')) {
                  tagBuffer += '</think>'
                }
                const cleaned = getSanitizedMessageContent(tagBuffer)
                sendChunk(cleaned)
              }
              flushBuffer()
            } catch (error) {
              controller.error(error)
            }
          } else {
            // Simpler implementation for other models
            let buffer = ''

            try {
              const response = Hf.textGenerationStream({
                model: modelConfig.model,
                inputs: modelConfig.inputs,
                parameters: modelConfig.parameters,
              })

              // Process each chunk as it arrives
              for await (const chunk of response) {
                if (chunk.token.text) {
                  // Check if this token contains any model-specific tags
                  const hasModelTags = /<[^>]*>/.test(chunk.token.text)
                    || /<\|.*?\|>/.test(chunk.token.text)

                  if (hasModelTags) {
                    // If we have model tags, accumulate in buffer and clean when complete
                    buffer += chunk.token.text
                    if (buffer.includes('>')) {
                      const cleaned = getSanitizedMessageContent(buffer)
                      if (cleaned) {
                        accumulatedText += cleaned
                        controller.enqueue(encoder.encode(`0:${JSON.stringify(cleaned)}\n`))
                      }
                      buffer = ''
                    }
                  } else {
                    // No model tags, stream directly while preserving whitespace
                    const token = chunk.token.text
                    accumulatedText += token
                    controller.enqueue(encoder.encode(`0:${JSON.stringify(token)}\n`))
                  }
                }
              }

              // Handle any remaining text in the buffer
              if (buffer) {
                const cleaned = getSanitizedMessageContent(buffer)
                if (cleaned) {
                  accumulatedText += cleaned
                  controller.enqueue(encoder.encode(`0:${JSON.stringify(cleaned)}\n`))
                }
              }
            } catch (error) {
              controller.error(error)
            }
          }

          // persist the complete message if we have a valid chat_id and are not in playground mode
          if (chat_id !== -1 && !is_playground) {
            if (LOG_BACKEND) {
              console.info('Final accumulated text to persist:', accumulatedText)
              console.info('Persisting AI message for user:', user.id, 'chat:', chat_id)
            }
            const result = await persistAiChatMessage(user.id, chat_id, accumulatedText, event)
            if (LOG_BACKEND) {
              console.info('Persistence result:', result)
            }
          }
          controller.close()
        },
      })

      // Set the appropriate headers
      setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
      setHeader(event, 'Transfer-Encoding', 'chunked')

      return stream
    } catch (error: unknown) {
      if (LOG_BACKEND) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        console.error('AI request errored:', errorMessage)
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
})
