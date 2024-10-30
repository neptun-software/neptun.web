import { InsertChatConversationShareSchema } from '~/lib/types/database.tables/schema';
import { createChatConversationShare } from '~/server/database/repositories/chatConversationShares';

// Create share for chat conversation
export default defineEventHandler(async (event) => {
  /* VALIDATE PARAMS */
  const maybeChatId = await validateParamChatId(event);
  if (maybeChatId.statusCode !== 200) {
    return sendError(
      event,
      createError({
        statusCode: maybeChatId.statusCode,
        statusMessage: maybeChatId.statusMessage,
        data: maybeChatId.data,
      })
    );
  }
  const chat_id = maybeChatId.data?.chat_id;

  /* VALIDATE BODY */
  const body = await readValidatedBody(event, (body) => {
    return InsertChatConversationShareSchema.safeParse(body);
  });
  if (!body.success || !body.data) {
    return sendError(
      event,
      createError({
        statusCode: 400,
        statusMessage:
          'Bad Request. Invalid body({ is_shared?(true), is_protected?(false), hashed_password?(null) }).',
        data: body.error,
      })
    );
  }
  const validatedBody = body.data;

  try {
    const createdChatConversationShare = await createChatConversationShare({
      ...validatedBody,
      chat_conversation_id: chat_id,
    });

    return {
      share: createdChatConversationShare,
    };
  } catch (error) {
    return sendError(
      event,
      createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        data: error,
      })
    );
  }
});
