import { eq } from 'drizzle-orm';
import {
  chat_conversation_share,
  chat_conversation_share_whitelist_entry,
  type ReadChatConversationShare,
  type ChatConversationShareWhitelistToCreate,
  type ReadChatConversationShareWhitelist,
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
    });

  if (!createdChatConversationShareWhitelistEntry) return null;

  return createdChatConversationShareWhitelistEntry;
};

export const readAllChatConversationShareWhitelistEntries = async (
  share_id: ReadChatConversationShare['share_uuid']
) => {
  const chatConversationShareWhitelistEntry =
    await db.query.chat_conversation_share_whitelist_entry.findMany({
      with: {
        chat_conversation_share: {
          columns: {},
        },
        neptun_user_id: {},
      },
      where: eq(chat_conversation_share.share_uuid, share_id),
    });

  return chatConversationShareWhitelistEntry;
};

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
    });

  return successfullyDeleted;
};
