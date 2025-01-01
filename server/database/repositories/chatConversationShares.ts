import { and, eq, exists, like } from 'drizzle-orm'
import {
  chat_conversation_message,
  chat_conversation_share,
  type ChatConversationShareToCreate,
  type ReadChatConversation,
  type ReadChatConversationShare,
} from '~/lib/types/database.tables/schema'

export async function createChatConversationShare(chat_share_entry: ChatConversationShareToCreate) {
  const createdChatConversationShare = await db
    .insert(chat_conversation_share)
    .values({
      ...chat_share_entry,
      hashed_password: encryptColumn(chat_share_entry.hashed_password || ''),
    })
    .returning()
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error(
          'Failed to create chat conversation share in database',
          err,
        )
      }
      return null
    })

  if (!createdChatConversationShare) {
    return null
  }

  return createdChatConversationShare[0]
}

export async function readShareUuid(chat_id: ReadChatConversation['id']) {
  const shareUUid = await db
    .select()
    .from(chat_conversation_share)
    .where(eq(chat_conversation_share.chat_conversation_id, chat_id))
    .then((data) => {
      return data[0]?.share_uuid ?? null
    })
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to fetch share from database', err)
      }
      return null
    })

  return shareUUid
}

export async function readShareInfo(chat_share_uuid: ReadChatConversationShare['share_uuid']) {
  const shareStatus: {
    shareExists: boolean
    shareIsActive: boolean
    shareIsPrivate: boolean
    shareHasPassword: boolean
  } = await db
    .select()
    .from(chat_conversation_share)
    .where(eq(chat_conversation_share.share_uuid, chat_share_uuid))
    .then((data) => {
      return {
        shareExists: data.length > 0,
        shareIsActive: data[0]?.is_shared ?? false,
        shareIsPrivate: data[0]?.is_protected ?? false,
        shareHasPassword:
          !!(data[0]?.hashed_password && data[0]?.hashed_password.length > 0),
      }
    })
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to fetch share from database', err)
      }
      return {
        shareExists: false,
        shareIsActive: false,
        shareIsPrivate: false,
        shareHasPassword: false,
      }
    })

  return shareStatus
}

export async function readChatConversationShareMessages(chat_share_uuid: ReadChatConversationShare['share_uuid']) {
  const chatConversationShareMessages
    = await db.query.chat_conversation_message.findMany({
      with: {
        chat_conversation: {
          columns: {
            id: true,
          },
          with: {
            chat_conversation_shares: {
              where: eq(chat_conversation_share.share_uuid, chat_share_uuid),
              columns: {
                id: true,
                is_shared: true,
                is_protected: true,
                created_at: true,
                updated_at: true,
              },
            },
          },
        },
      },
      where: exists(
        db
          .select()
          .from(chat_conversation_share)
          .where(
            and(
              eq(
                chat_conversation_share.chat_conversation_id,
                chat_conversation_message.chat_conversation_id,
              ),
              eq(chat_conversation_share.share_uuid, chat_share_uuid),
            ),
          ),
      ),
      columns: {
        id: true,
        message: true,
        actor: true,
        created_at: true,
        updated_at: true,
      },
    })

  return chatConversationShareMessages
}

export async function sharePasswordIsValid(chat_share_uuid: ReadChatConversationShare['share_uuid'], plain_password: ReadChatConversationShare['hashed_password']) {
  const sharePasswordIsValid = await db
    .select()
    .from(chat_conversation_share)
    .where(
      and(
        like(chat_conversation_share.hashed_password, encryptColumn(plain_password)),
        eq(chat_conversation_share.share_uuid, chat_share_uuid),
      ),
    )
    .then(data => data.length > 0)
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to fetch share from database', err)
      }
      return false
    })

  return sharePasswordIsValid
}

export async function updateChatConversationShare(chat_share_id: ReadChatConversationShare['id'], fields_to_update: Partial<ChatConversationShareToCreate>) {
  const updatedChatConversationShare = await db
    .update(chat_conversation_share)
    .set(fields_to_update)
    .where(eq(chat_conversation_share.id, chat_share_id))
    .returning()
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error(
          'Failed to update chat conversation share in database',
          err,
        )
      }
      return null
    })

  if (!updatedChatConversationShare) {
    return null
  }

  return updatedChatConversationShare[0]
}
