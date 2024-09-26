import {
  readChatConversationShareMessages,
  readShareInfo,
  sharePasswordIsValid
} from '~/server/database/repositories/chatConversationShares';
import { readAllChatConversationShareWhitelistEntries } from '~/server/database/repositories/chatConversationShareWhitelists';

async function userIsAuthorizedToViewChat(
  share_id: string,
  { username, password }: { username: string, password: string }
) {
  return username === '' && (await sharePasswordIsValid(share_id, password));
}

// Read all messages of a shared chat conversation
// Basic Auth is just base64 encoded, but we use ssl, so it should be fine, because the resource is not that important
export default defineEventHandler(async (event) => {
  const maybeUuid = await validateParamUuid(event);
  if (maybeUuid.statusCode !== 200) {
    return sendError(
      event,
      createError({
        statusCode: maybeUuid.statusCode,
        statusMessage: maybeUuid.statusMessage,
        data: maybeUuid.data
      })
    );
  }
  const uuid = maybeUuid.data?.uuid;

  const fetchedChatConversationShareWhitelistEntries
    = await readAllChatConversationShareWhitelistEntries(uuid);
  const shareHasWhitelist
    = fetchedChatConversationShareWhitelistEntries.length > 0;

  const info = await readShareInfo(uuid);
  if (!info.shareExists) {
    return sendError(
      event,
      createError({
        statusCode: 404,
        statusMessage: 'Not Found (share not found)',
        message: 'The share does not exist.',
        data: {
          shareInfo: {
            ...info,
            shareHasWhitelist
          }
        }
      })
    );
  }

  if (info.shareIsPrivate && info.shareHasPassword) {
    const authHeader = event.node.req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      setResponseHeader(
        event,
        'WWW-Authenticate',
        'Basic realm="neptun.shared.chat"'
      );
      return sendError(
        event,
        createError({
          statusCode: 401,
          statusMessage: 'Unauthorized (incorrect credentials)',
          message: 'You are not authorized to view this chat.',
          data: {
            shareInfo: {
              ...info,
              shareHasWhitelist
            }
          }
        })
      );
    }

    const base64Credentials = authHeader.split(' ')[1];
    const [username, password] = Buffer.from(base64Credentials, 'base64')
      .toString()
      .split(':');
    if (
      !(await userIsAuthorizedToViewChat(uuid, {
        username,
        password
      }))
    ) {
      return sendError(
        event,
        createError({
          statusCode: 401,
          statusMessage: 'Unauthorized (incorrect credentials)',
          message: 'You are not authorized to view this chat.',
          data: {
            shareInfo: {
              ...info,
              shareHasWhitelist
            }
          }
        })
      );
    }
  }

  // TODO: check for oAuth emails too
  if (fetchedChatConversationShareWhitelistEntries.length !== 0) {
    const session = await requireUserSession(event);
    const user = session.user;
    const email = user.primary_email;

    if (
      !fetchedChatConversationShareWhitelistEntries
        .map(entry => entry.neptun_user_id.primary_email)
        .includes(email)
    ) {
      return sendError(
        event,
        createError({
          statusCode: 403,
          statusMessage: 'Forbidden (not on whitelist)',
          message: 'You are not on the whitelist.',
          data: {
            shareInfo: {
              ...info,
              shareHasWhitelist
            }
          }
        })
      );
    }
  }

  const fetchedChatMessages = await readChatConversationShareMessages(uuid);

  return {
    chatMessages: fetchedChatMessages,
    shareInfo: info
  }
});
