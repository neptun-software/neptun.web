import type { Actor } from '~/lib/types/database.tables/schema'
import { createError } from 'h3'
import { POSSIBLE_AI_MODELS } from '~/lib/data/ai.models'
import { ChatConversationMessagesToCreateSchema } from '~/lib/types/database.tables/schema'
import { persistAiChatMessage, persistUserChatMessage } from '~/server/utils/chat'
import { validateParamAiModelName, validateQueryChatId } from '~/server/utils/validate'

interface CloudflareError {
  code: number
  message: string
}

interface CloudflareErrorResponse {
  errors: CloudflareError[]
  success: boolean
}

interface CloudflareStreamResponse {
  response: string
}

export default defineEventHandler(async (event) => {
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

  if (!model_name || !POSSIBLE_AI_MODELS.cloudflare?.[model_name]) {
    throw createError({
      statusCode: 400,
      message: `Invalid model: ${model_name}`,
    })
  }

  const modelConfig = POSSIBLE_AI_MODELS.cloudflare[model_name]

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

  const SYSTEM_MESSAGE = 'You have to answer all my questions and provide all information using Markdown syntax. This includes formatting text, adding lists, inserting links, using code blocks, and any other Markdown features that are appropriate for your responses.'
  if (!messages.some(message => message.content === SYSTEM_MESSAGE)) {
    if (LOG_BACKEND) {
      console.info('No system message found. Adding initial system message...')
    }
    messages.unshift({
      role: 'user' as Actor,
      content: SYSTEM_MESSAGE,
    })
  }

  const userMessage = messages[messages.length - 1]
  // always persist user message if we have a valid chat_id and are not in playground mode
  if (chat_id !== -1 && !is_playground) {
    await persistUserChatMessage(user.id, chat_id, userMessage.content, event)
  }

  try {
    const config = modelConfig.configuration('')

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
    if (!accountId) {
      throw createError({
        statusCode: 500,
        message: 'CLOUDFLARE_ACCOUNT_ID is not configured',
      })
    }

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        let accumulatedText = ''
        let buffer = ''

        const sendToken = (text: string) => {
          accumulatedText += text
          controller.enqueue(encoder.encode(`0:${JSON.stringify(text)}\n`))
        }

        const flushBuffer = () => {
          if (buffer) {
            sendToken(buffer)
            buffer = ''
          }
        }

        try {
          const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${config.model}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messages: messages.map(msg => ({
                role: msg.role,
                content: msg.content,
              })),
              stream: true,
              max_tokens: 256,
              temperature: 0.6,
              top_p: 0.9,
              top_k: 10,
              repetition_penalty: 1.1,
              frequency_penalty: 1.0,
              presence_penalty: 1.0,
            }),
          })

          if (!response.ok) {
            const error = await response.json() as CloudflareErrorResponse
            throw createError({
              statusCode: response.status,
              message: error.errors?.[0]?.message || 'Failed to generate response',
            })
          }

          const reader = response.body?.getReader()
          if (!reader) {
            throw new Error('No reader available')
          }

          while (true) {
            const { done, value } = await reader.read()
            if (done) {
              flushBuffer()
              break
            }

            // Parse the chunk and extract the text
            const chunk = new TextDecoder().decode(value)
            const lines = chunk.split('\n').filter(line => line.trim() !== '')

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataContent = line.slice(6)
                // Skip the [DONE] message
                if (dataContent === '[DONE]') {
                  continue
                }

                const data = JSON.parse(dataContent) as CloudflareStreamResponse
                if (data.response) {
                  const token: string = data.response

                  // Check if we're in the middle of a Markdown construct
                  const isInMarkdown = buffer && (
                    // Headers
                    buffer.match(/^#{1,6}[^#\n]*$/)
                    // Unfinished emphasis
                    || buffer.match(/([*_~`])[^*_~`]*$/)
                    // Unfinished link
                    || buffer.match(/\[[^\]]*$/)
                    || (buffer.match(/\[[^\]]*\]\([^)]*$/) && !buffer.includes(']('))
                    // Unfinished code block
                    || (buffer.match(/```[^`]*$/) && !buffer.match(/```.*```/))
                    // Unfinished table row
                    || (buffer.includes('|') && !buffer.endsWith('\n'))
                  )

                  // Start buffering if we see the start of a Markdown construct
                  const isStartingMarkdown = !buffer && (
                    token.startsWith('#')
                    || token.startsWith('*')
                    || token.startsWith('_')
                    || token.startsWith('`')
                    || token.startsWith('[')
                    || token.startsWith('|')
                  )

                  if (isInMarkdown || isStartingMarkdown) {
                    buffer += token
                    // Check if we've completed the Markdown construct
                    if (
                      // Complete header
                      (buffer.startsWith('#') && !token.trim().endsWith(' '))
                      // Complete emphasis
                      || buffer.match(/(\*|__|[_`]|~~)[^*_~`]+\1/)
                      // Complete link
                      || buffer.match(/\[[^\]]*\]\([^)]*\)/)
                      // Complete code block
                      || buffer.match(/```.*```/)
                      // Complete table row
                      || (buffer.includes('|') && buffer.endsWith('\n'))
                    ) {
                      flushBuffer()
                    }
                  } else {
                    // If not in a Markdown construct, stream directly
                    sendToken(token)
                  }
                }
              }
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
        } catch (error) {
          controller.error(error)
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
