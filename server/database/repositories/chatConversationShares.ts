import { and, eq, like } from 'drizzle-orm';
import {
  chat_conversation_share,
  type ChatConversationShareToCreate,
  type ReadChatConversationShare,
} from '~/lib/types/database.tables/schema';

export const createChatConversationShare = async (
  share: ChatConversationShareToCreate
) => {
  const createdChatConversationShare = await db
    .insert(chat_conversation_share)
    .values({
      ...share,
      hashed_password: encryptColumn(share.hashed_password || ''),
    })
    .returning()
    .catch((err) => {
      if (LOG_BACKEND)
        console.error(
          'Failed to create chat conversation share in database',
          err
        );
      return null;
    });

  if (!createdChatConversationShare) return null;

  return createdChatConversationShare[0];
};

export const readShareInfo = async (
  id: ReadChatConversationShare['share_uuid']
) => {
  const shareStatus = await db
    .select()
    .from(chat_conversation_share)
    .where(eq(chat_conversation_share.share_uuid, id))
    .then((data) => {
      return {
        shareExists: data.length > 0,
        shareIsActive: data[0]?.is_shared ?? false,
        shareIsPrivate: data[0]?.is_protected ?? false,
      };
    })
    .catch((err) => {
      if (LOG_BACKEND)
        console.error('Failed to fetch share from database', err);
      return {
        shareExists: false,
        shareIsActive: false,
        shareIsPrivate: false,
      };
    });

  return shareStatus;
};

export const readChatConversationShareMessages = async (
  id: ReadChatConversationShare['share_uuid']
) => {
  const chatConversationShareMessages =
    await db.query.chat_conversation_message.findMany({
      with: {
        chat_conversation: {
          with: {
            chat_conversation_shares: {
              where: eq(chat_conversation_share.share_uuid, id),
              columns: {
                id: true,
                is_shared: true,
                is_protected: true,
                created_at: true,
                updated_at: true,
              },
            },
          },
          columns: {
            id: true,
          },
        },
      },
      columns: {
        id: true,
        message: true,
        actor: true,
        created_at: true,
        updated_at: true,
      },
    });

  return chatConversationShareMessages;
};

export const sharePasswordIsValid = async (
  id: ReadChatConversationShare['share_uuid'],
  password: string
) => {
  const sharePasswordIsValid = await db
    .select()
    .from(chat_conversation_share)
    .where(
      and(
        like(chat_conversation_share.hashed_password, encryptColumn(password)),
        eq(chat_conversation_share.share_uuid, id)
      )
    )
    .then((data) => data.length > 0)
    .catch((err) => {
      if (LOG_BACKEND)
        console.error('Failed to fetch share from database', err);
      return false;
    });

  return sharePasswordIsValid;
};

export const updateChatConversationShare = async (
  id: ReadChatConversationShare['id'],
  fields: Partial<ChatConversationShareToCreate>
) => {
  const updatedChatConversationShare = await db
    .update(chat_conversation_share)
    .set(fields)
    .where(eq(chat_conversation_share.id, id))
    .returning()
    .catch((err) => {
      if (LOG_BACKEND)
        console.error(
          'Failed to update chat conversation share in database',
          err
        );
      return null;
    });

  if (!updatedChatConversationShare) return null;

  return updatedChatConversationShare[0];
};
