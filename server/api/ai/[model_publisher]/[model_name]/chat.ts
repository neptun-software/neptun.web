import { createError } from 'h3'
import { POSSIBLE_AI_MODELS } from '~/lib/data/ai.models'
import { ChatConversationMessagesToCreateSchema } from '~/lib/types/database.tables/schema'
import { validateParamAiModelName, validateQueryChatId } from '~/server/utils/validate'
import { AllowedAiModelPublishersEnum } from '~/lib/types/models/ai'

export default defineEventHandler(async (event) => {
    if (LOG_BACKEND) {
        console.info('AI chat router endpoint called')
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

    /* VALIDATE BODY */
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
    const model_publisher = maybeModelName.data?.model_publisher

    // Validate the model publisher exists
    if (!POSSIBLE_AI_MODELS[model_publisher]) {
        throw createError({
            statusCode: 400,
            message: `Invalid model publisher: ${model_publisher}`,
        })
    }

    // Validate the model exists for this publisher
    if (!POSSIBLE_AI_MODELS[model_publisher][model_name]) {
        throw createError({
            statusCode: 400,
            message: `Invalid model: ${model_name} for publisher ${model_publisher}`,
        })
    }

    try {
        // Route to the appropriate provider endpoint based on the model publisher
        let providerEndpoint
        switch (model_publisher as AllowedAiModelPublishersEnum) {
            case AllowedAiModelPublishersEnum.Cloudflare:
                providerEndpoint = `/api/ai/cloudflare/${model_name}/chat`
                break
            case AllowedAiModelPublishersEnum.Qwen:
            case AllowedAiModelPublishersEnum.DeepSeek:
            case AllowedAiModelPublishersEnum.Mistral:
            case AllowedAiModelPublishersEnum.Google:
            case AllowedAiModelPublishersEnum.Microsoft:
                providerEndpoint = `/api/ai/huggingface/${model_publisher}/${model_name}/chat`
                break
            case AllowedAiModelPublishersEnum.Ollama:
                providerEndpoint = `/api/ai/ollama/${model_name}/chat`
                break
            case AllowedAiModelPublishersEnum.OpenRouter:
                providerEndpoint = `/api/ai/openrouter/${model_name}/chat`
                break
            default:
                throw createError({
                    statusCode: 400,
                    message: `Unsupported model publisher: ${model_publisher}`,
                })
        }

        // Forward the request to the provider endpoint and stream the response
        setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
        setHeader(event, 'Transfer-Encoding', 'chunked')

        // Create a readable stream to proxy the provider's response
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    const response = await event.$fetch(providerEndpoint, {
                        method: 'POST',
                        query: {
                            chat_id,
                            is_playground,
                        },
                        body: { messages },
                        responseType: 'stream',
                    })

                    // If the response is a ReadableStream, pipe it through
                    if (response instanceof ReadableStream) {
                        const reader = response.getReader()
                        while (true) {
                            const { done, value } = await reader.read()
                            if (done) break
                            controller.enqueue(value)
                        }
                    } else {
                        // If it's not a stream (shouldn't happen), just send it as one chunk
                        const encoder = new TextEncoder()
                        controller.enqueue(encoder.encode(response as string))
                    }
                } catch (error) {
                    controller.error(error)
                }
                controller.close()
            }
        })

        return stream
    } catch (error: unknown) {
        if (LOG_BACKEND) {
            console.error('AI router request failed:', {
                error: error instanceof Error
                    ? {
                        name: error.name,
                        message: error.message,
                        stack: error.stack,
                        cause: error.cause,
                    }
                    : error,
                model_publisher,
                model_name,
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
