import { eq } from 'drizzle-orm';
import {
  chat_conversation_share_whitelist_entry,
  type ReadChatConversationShare,
  type ChatConversationShareWhitelistToCreate,
  type ReadChatConversationShareWhitelist,
  neptun_user
} from '~/lib/types/database.tables/schema';

export const createChatConversationShareWhitelistEntries = async (
  data: ChatConversationShareWhitelistToCreate[]
) => {
  const createdChatConversationShareWhitelistEntry = await db
    .insert(chat_conversation_share_whitelist_entry)
    .values(data)
    .returning()
    .catch((err) => {
      if (LOG_BACKEND)
        console.error(
          'Failed to create chat conversation share whitelist in database',
          err
        );
      return null;
    })

  if (!createdChatConversationShareWhitelistEntry) return null;

  return createdChatConversationShareWhitelistEntry;
}

export const readAllChatConversationShareWhitelistEntries = async (
  share_id: ReadChatConversationShare['share_uuid']
) => {
  const chatConversationShareWhitelistEntries
    = await db.query.chat_conversation_share.findFirst({
      where: (chat_conversation_share, { eq }) =>
        eq(chat_conversation_share.share_uuid, share_id),
      with: {
        chat_conversation_shares_whitelisted: {
          columns: {},
          with: {
            neptun_user_id: {
              columns: {
                primary_email: true
              },
              extras: {
                primary_email: decryptColumn(neptun_user.primary_email).as(
                  'primary_email'
                )
              }
            }
          }
        }
      },
      columns: {
        share_uuid: true
      }
    });

  return (
    chatConversationShareWhitelistEntries?.chat_conversation_shares_whitelisted
    ?? []
  );
}

export const deleteChatConversationShareWhitelistEntry = async (
  id: ReadChatConversationShareWhitelist['id']
) => {
  const successfullyDeleted = await db
    .delete(chat_conversation_share_whitelist_entry)
    .where(eq(chat_conversation_share_whitelist_entry.id, id))
    .then(() => true)
    .catch((err) => {
      if (LOG_BACKEND)
        console.error(
          'Failed to delete chat conversation share whitelist from database',
          err
        );
      return false;
    })

  return successfullyDeleted;
}
