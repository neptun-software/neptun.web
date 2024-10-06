import { EmailListToCreateSchema } from '~/lib/types/database.tables/schema';
import { createChatConversationShareWhitelistEntries } from '~/server/database/repositories/chatConversationShareWhitelists';
import { readUserIdsOfPrimaryEmails } from '~/server/database/repositories/users';

// Create chat conversation share whitelist entry
export default defineEventHandler(async (event) => {
  /* VALIDATE PARAMS */
  const maybeShareId = await validateParamShareId(event);
  if (maybeShareId.statusCode !== 200) {
    return sendError(
      event,
      createError({
        statusCode: maybeShareId.statusCode,
        statusMessage: maybeShareId.statusMessage,
        data: maybeShareId.data
      })
    );
  }
  const user_id = maybeShareId.data?.user_id;
  const share_id = maybeShareId.data?.share_id;

  /* VALIDATE BODY */
  const body = await readValidatedBody(event, (body) => {
    return EmailListToCreateSchema.safeParse(body);
  })
  if (!body.success || !body.data) {
    return sendError(
      event,
      createError({
        statusCode: 400,
        statusMessage:
          'Bad Request. Invalid body({ is_shared?(true), is_protected?(false), hashed_password?(null) }).',
        data: body.error
      })
    );
  }
  const validatedBody = body.data;

  const user_ids = await readUserIdsOfPrimaryEmails(validatedBody);
  // console.log('user_ids', user_ids);
  const emailWhiteList = user_ids ?? []; // checking !user_ids || user_ids.length === 0 and returning an error would be bad, because people could use this feature for brute-forcing
  emailWhiteList?.push({
    id: user_id
  })

  const entriesToCreate = emailWhiteList.map((user_id) => {
    return {
      whitelisted_neptun_user_id: user_id.id,
      chat_conversation_share_id: share_id
    }
  });

  // console.log('entriesToCreate', entriesToCreate);
  const createdChatConversationShareWhitelistEntries
    = await createChatConversationShareWhitelistEntries(entriesToCreate);

  return {
    shareWhitelistEntries: createdChatConversationShareWhitelistEntries
  }
});
