import { eq } from 'drizzle-orm'
import {
  chat_conversation_file,
  type ChatConversationFileToCreate,
  type ReadChatConversationFile
} from '~/lib/types/database.tables/schema'

export async function createChatConversationFiles(
  files: ChatConversationFileToCreate[]
) {
  const createdChatConversationFiles = await db
    .insert(chat_conversation_file)
    .values(files)
    .returning()
    .catch((err) => {
      if (LOG_BACKEND)
        console.error(
          'Failed to create chat conversation files in database',
          err
        );
      return null;
    })

  if (!createdChatConversationFiles) return null;

  return createdChatConversationFiles;
}

export async function readAllChatConversationFilesOfChatConversation(
  chat_conversation_id: ReadChatConversationFile['chat_conversation_id']
) {
  const chatConversationFiles = await db
    .select()
    .from(chat_conversation_file)
    .where(
      eq(chat_conversation_file.chat_conversation_id, chat_conversation_id)
    )
    .catch((err) => {
      if (LOG_BACKEND)
        console.error(
          'Failed to read chat conversation files from database',
          err
        );
      return null;
    })

  if (!chatConversationFiles) return null;

  return chatConversationFiles;
}
