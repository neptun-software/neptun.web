import { readAllChatConversationFilesOfChatConversation } from '~/server/database/repositories/chatConversationFiles'

// Read all files of chat conversation
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

  const fetchedChatFiles
    = await readAllChatConversationFilesOfChatConversation(chat_id)

  return {
    chatFiles: fetchedChatFiles,
  }
})
