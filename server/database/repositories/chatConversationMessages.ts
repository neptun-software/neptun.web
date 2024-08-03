import {
  chat_conversation_message,
  type ChatConversationMessageToCreate,
  type ReadChatConversation,
  type ReadChatConversationMessage,
} from '../../../lib/types/database.tables/schema';
import { eq, asc } from 'drizzle-orm';

export const createChatConversationMessages = async (
  messages: ChatConversationMessageToCreate[]
) => {
  const createdChatConversationMessages = await db
    .insert(chat_conversation_message)
    .values(messages)
    .returning()
    .catch((err) => {
      if (LOG_BACKEND)
        console.error(
          'Failed to insert chat conversation message into database',
          err
        );
      return null;
    });

  if (!createdChatConversationMessages) return null;

  return createdChatConversationMessages;
};

export const readChatConversationMessages = async (
  chat_conversation_id: ReadChatConversation['id']
) => {
  const chatConversationMessages = await db
    .select()
    .from(chat_conversation_message)
    .where(
      eq(chat_conversation_message.chat_conversation_id, chat_conversation_id)
    )
    .orderBy(asc(chat_conversation_message.updated_at))
    .catch((err) => {
      if (LOG_BACKEND)
        console.error(
          'Failed to read chat conversation messages from database',
          err
        );
      return null;
    });

  if (!chatConversationMessages) return null;

  return chatConversationMessages;
};

export const deleteChatConversationMessage = async (
  id: ReadChatConversationMessage['id']
) => {
  const successfullyDeleted = await db
    .delete(chat_conversation_message)
    .where(eq(chat_conversation_message.id, id))
    .then(() => true)
    .catch((err) => {
      if (LOG_BACKEND)
        console.error(
          'Failed to delete chat conversation message from database',
          err
        );
      return false;
    });

  return successfullyDeleted;
};
