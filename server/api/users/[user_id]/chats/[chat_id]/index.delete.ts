import { deleteChatConversation } from '~/server/database/repositories/chatConversations';

// Delete chat conversation
export default defineEventHandler(async (event) => {
  /* VALIDATE PARAMS */
  const maybeChatId = await validateParamChatId(event);
  if (maybeChatId.statusCode !== 200) {
    return sendError(
      event,
      createError({
        statusCode: maybeChatId.statusCode,
        statusMessage: maybeChatId.statusMessage,
        data: maybeChatId.data
      })
    );
  }
  const chat_id = maybeChatId.data?.chat_id;

  return await deleteChatConversation(chat_id);
  // return null; // => No Content
})
