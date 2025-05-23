import type { Actor } from '~/lib/types/database.tables/schema'
import { streamText } from 'ai'
import { createError } from 'h3'
import { createOllama } from 'ollama-ai-provider'
import { POSSIBLE_AI_MODELS } from '~/lib/data/ai.models'
import { ChatConversationMessagesToCreateSchema } from '~/lib/types/database.tables/schema'
import { readProjectContext } from '~/server/database/repositories/projectContext'
import { persistAiChatMessage, persistUserChatMessage } from '~/server/utils/chat'
import { isValidUser, validateParamAiModelName, validateQueryChatId } from '~/server/utils/validate'

// TODO: Make index endpoint using the appropriate provider - also "default" provider endpoint that is just vercel ai, to reduce code duplication in ollama and openrouter.
export default defineEventHandler(async (event) => {
  if (LOG_BACKEND) {
    console.info('Ollama chat endpoint called')
  }

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

  if (!model_name || !POSSIBLE_AI_MODELS.ollama?.[model_name]) {
    if (LOG_BACKEND) {
      console.error('Invalid model configuration:', { model_name, available_models: Object.keys(POSSIBLE_AI_MODELS.ollama || {}) })
    }
    throw createError({
      statusCode: 400,
      message: `Invalid model: ${model_name}`,
    })
  }

  const modelConfig = POSSIBLE_AI_MODELS.ollama[model_name]
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
  if (!messages.some(message => message.content === SYSTEM_MESSAGE)) {
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

    const baseURL = 'http://130.61.252.184:7869/api'
    try {
      // Test the connection first
      const version = await fetch(`${baseURL}/version`)
      const tags = await fetch(`${baseURL}/tags`)
      if (!version.ok || !tags.ok) {
        throw createError({
          statusCode: 503,
          message: `Ollama server not available: ${version.statusText}`,
        })
      }
      if (LOG_BACKEND) {
        console.info('Ollama server version:', await version.text())
        console.info('Ollama server tags:', await tags.text())
      }
    } catch (error) {
      console.error('Failed to connect to Ollama server:', error)
      throw createError({
        statusCode: 503,
        message: 'Failed to connect to Ollama server',
      })
    }

    const ollama = createOllama({
      baseURL,
    })

    let systemPrompt = ''
    // Add project context if available
    if (chat_id !== -1 && !is_playground) {
      systemPrompt = JSON.stringify(await readProjectContext(user.id, chat_id))
    }

    const result = streamText({
      model: ollama(config.model),
      system: systemPrompt,
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

    void result.consumeStream()
    return result.toDataStreamResponse()
  } catch (error: unknown) {
    if (LOG_BACKEND) {
      console.error('Ollama request failed:', {
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
