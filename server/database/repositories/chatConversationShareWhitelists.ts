import type { ChatConversationShareWhitelistToCreate, ReadChatConversationShare, ReadChatConversationShareWhitelist } from '~/lib/types/database.tables/schema'
import { eq } from 'drizzle-orm'
import {
  chat_conversation_share_whitelist_entry,

  neptun_user,

} from '~/lib/types/database.tables/schema'

export async function createChatConversationShareWhitelistEntries(chat_share_whitelist_entry_list: ChatConversationShareWhitelistToCreate[]) {
  const createdChatConversationShareWhitelistEntry = await db
    .insert(chat_conversation_share_whitelist_entry)
    .values(chat_share_whitelist_entry_list)
    .returning()
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error(
          'Failed to create chat conversation share whitelist in database',
          err,
        )
      }
      return null
    })

  if (!createdChatConversationShareWhitelistEntry) {
    return null
  }

  return createdChatConversationShareWhitelistEntry
}

export async function readAllChatConversationShareWhitelistEntries(chat_share_uuid: ReadChatConversationShare['share_uuid']) {
  const chatConversationShareWhitelistEntries
    = await db.query.chat_conversation_share.findFirst({
      where: (chat_conversation_share, { eq }) =>
        eq(chat_conversation_share.share_uuid, chat_share_uuid),
      with: {
        chat_conversation_shares_whitelisted: {
          columns: {},
          with: {
            neptun_user_id: {
              columns: {
                primary_email: true,
              },
              extras: {
                primary_email: decryptColumn(neptun_user.primary_email).as(
                  'primary_email',
                ),
              },
            },
          },
        },
      },
      columns: {
        share_uuid: true,
      },
    })

  return (
    chatConversationShareWhitelistEntries?.chat_conversation_shares_whitelisted
    ?? []
  )
}

export async function deleteChatConversationShareWhitelistEntry(chat_share_whitelist_entry_id: ReadChatConversationShareWhitelist['id']) {
  const successfullyDeleted = await db
    .delete(chat_conversation_share_whitelist_entry)
    .where(eq(chat_conversation_share_whitelist_entry.id, chat_share_whitelist_entry_id))
    .then(() => true)
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error(
          'Failed to delete chat conversation share whitelist from database',
          err,
        )
      }
      return false
    })

  return successfullyDeleted
}
