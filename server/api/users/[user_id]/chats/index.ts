import type { HTTPMethod } from 'h3';
import type { ChatConversationToCreate } from '~/lib/types/database.tables/schema';
import {
  createChatConversation,
  deleteChatConversations,
  readAllChatConversationsOfUser,
} from '~/server/database/repositories/chatConversations';
import { ChatConversationToCreateSchema, ChatConversationsToDelete } from '~/lib/types/database.tables/schema';

export default defineEventHandler(async (event) => {
  /* 0. VALIDATE METHOD */
  assertMethod(event, ['POST', 'DELETE', 'GET']);

  /* 1. GET METHOD AND QUERY PARAMETERS */
  const method = event.node.req.method as HTTPMethod;

  const maybeUserId = await validateParamUserId(event);
  if (maybeUserId.statusCode !== 200) {
    return sendError(
      event,
      createError({
        statusCode: maybeUserId.statusCode,
        statusMessage: maybeUserId.statusMessage,
        data: maybeUserId.data,
      })
    );
  }
  const user_id = maybeUserId.data?.user_id;

  /* 2. VALIDATE BODY(model, name) */
  if (method === 'POST') {
    const body = await readValidatedBody(event, (body) =>
      ChatConversationToCreateSchema.safeParse(body)
    );
    if (!body.success || !body.data) {
      return sendError(
        event,
        createError({
          statusCode: 400,
          statusMessage: 'Bad Request. Invalid body(model, name).',
          data: body.error,
        })
      );
    }
    const validatedBody = body.data;
    const { model, name } = validatedBody;

    /* 3.1 CREATE NEW CHAT(model, name) */
    if (LOG_BACKEND) console.info(`creating new chat (${validatedBody})...`);

    const chatToCreate: ChatConversationToCreate = {
      neptun_user_id: user_id,
      model,
      name,
    };

    const createdChatConversation = await createChatConversation(chatToCreate);

    return {
      chat: createdChatConversation,
    };
  } else if (method === 'DELETE') {
    /* 3.2 DELETE ALL CHATS / A LIST OF CHAT IDs */
    const body = await readValidatedBody(event, (body) =>
      ChatConversationsToDelete.safeParse(body)
    );
    if (!body.success || !body.data) {
      return sendError(
        event,
        createError({
          statusCode: 400,
          statusMessage: 'Bad Request. Invalid body(chat_ids).',
          data: body.error,
        })
      );
    }
    const validatedBody = body.data;
    const { chat_ids } = validatedBody;

    return await deleteChatConversations(chat_ids);
    // return null; // => No Content
  } else {
    /* 3.3 READ ALL CHATS */
    const maybeOrderBy = await validateQueryOrderBy(event);
    if (maybeOrderBy.statusCode !== 200) {
      return sendError(
        event,
        createError({
          statusCode: maybeOrderBy.statusCode,
          statusMessage: maybeOrderBy.statusMessage,
          data: maybeOrderBy.data,
        })
      );
    }
    const order_by = maybeOrderBy.data?.order_by;

    if (LOG_BACKEND) {
      console.info(
        `fetching all chats of user ${user_id} with order_by(${order_by})...`
      );
    }

    const fetchedChatConversations = await readAllChatConversationsOfUser(
      user_id,
      order_by
    );

    return {
      chats: fetchedChatConversations,
    };
  }
});
