import { updateChatConversation } from '~/server/database/repositories/chatConversations';
import { ChatConversationAttributesToUpdateSchema } from '~/lib/types/database.tables/schema';

// Update chat conversation
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

  /* VALIDATE BODY */
  const body = await readValidatedBody(event, body =>
    ChatConversationAttributesToUpdateSchema.safeParse(body)
  );
  if (!body.success || !body.data) {
    return sendError(
      event,
      createError({
        statusCode: 400,
        statusMessage: 'Bad Request. Invalid body(name).',
        data: body.error
      })
    );
  }
  const validatedBody = body.data;
  const { name } = validatedBody;

  if (LOG_BACKEND) console.info('Renaming chat to', validatedBody.name);

  /* UPDATE CHAT CONVERSATION */

  const updatedChatConversation = await updateChatConversation(chat_id, {
    name
  })

  if (LOG_BACKEND) {
    console.info('updatedChatConversation:', updatedChatConversation);
  }

  return {
    chat: updatedChatConversation
  }
});
