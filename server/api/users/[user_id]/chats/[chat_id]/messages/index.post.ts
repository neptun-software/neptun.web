import { ChatConversationMessagesToCreateUniversalSchema } from '~/lib/types/database.tables/schema'
import { createChatConversationMessages } from '~/server/database/repositories/chatConversationMessages'

// Create messages for chat conversation
export default defineEventHandler(async (event) => {
  /* VALIDATE PARAMS */
  const maybeChatId = await validateParamChatId(event)
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
  const user_id = maybeChatId.data?.user_id
  const chat_id = maybeChatId.data?.chat_id

  /* VALIDATE BODY */
  const body = await readValidatedBody(event, (body) => {
    return ChatConversationMessagesToCreateUniversalSchema.safeParse(body)
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

  if (validatedBody && 'message' in validatedBody && 'actor' in validatedBody) {
    const { message, actor } = validatedBody

    const conversationMessageToCreate = {
      message,
      actor,
      neptun_user_id: user_id,
      chat_conversation_id: chat_id,
    }

    const createdMessage = await createChatConversationMessages([
      conversationMessageToCreate,
    ])

    return {
      chatMessage: createdMessage,
    }
  }
  else if (validatedBody && 'messages' in validatedBody) {
    const messages = validatedBody.messages.map(({ content, role }) => ({
      message: content,
      actor: role,
      neptun_user_id: user_id,
      chat_conversation_id: chat_id,
    }))

    const createdMessages = await createChatConversationMessages(messages)

    return {
      chatMessages: createdMessages,
    }
  }

  return sendError(
    event,
    createError({
      statusCode: 400,
      statusMessage: 'Bad Request. Invalid body(message | messages).',
    }),
  )
})
