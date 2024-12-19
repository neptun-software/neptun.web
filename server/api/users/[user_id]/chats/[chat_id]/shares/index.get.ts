import { readShareUuid } from '~/server/database/repositories/chatConversationShares'

// Check if chat conversation has share
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
  const chat_id = maybeChatId.data?.chat_id

  return await readShareUuid(chat_id)
})
