import type { DatabaseError } from 'pg'
import { eq } from 'drizzle-orm'
import {
  chat_conversation_file,
  type ChatConversationFileToCreate,
  neptun_user_file,
  type ReadChatConversationFile,
} from '~/lib/types/database.tables/schema'

export async function createChatConversationFiles(
  chat_file_list: ChatConversationFileToCreate[],
) {
  return db.transaction(async (tx) => {
    const createdFiles: ReadChatConversationFile[] = []

    for (const file of chat_file_list) {
      try {
        const { title, text, language, extension, ...chatFileData } = file

        // File Base
        const [userFile] = await tx
          .insert(neptun_user_file)
          .values({
            title,
            text,
            language: language || 'text',
            extension: extension || 'txt',
            neptun_user_id: chatFileData.neptun_user_id,
          })
          .returning()

        if (!userFile) {
          continue
        }

        // Chat File
        const [chatFile] = await tx
          .insert(chat_conversation_file)
          .values({
            ...chatFileData,
            neptun_user_file_id: userFile.id,
          })
          .returning()

        if (chatFile) {
          createdFiles.push({
            ...chatFile,
            title: userFile.title ?? '',
            text: userFile.text ?? '',
            language: userFile.language ?? 'text',
            extension: userFile.extension ?? 'txt',
          } satisfies ReadChatConversationFile)
        }
      } catch (error) {
        const pgError = error as DatabaseError
        console.error('Failed to create file:', pgError.message)
        continue // Skip failed file but continue with others
      }
    }

    return createdFiles.length > 0 ? createdFiles : null
  }).catch((error) => {
    if (LOG_BACKEND) {
      const pgError = error as DatabaseError
      console.error('Failed to create chat conversation files in database:', pgError.message)
    }
    return null
  })
}

export async function readAllChatConversationFilesOfChatConversation(
  chat_id: ReadChatConversationFile['chat_conversation_id'],
) {
  const chatConversationFiles = await db.query.chat_conversation_file.findMany({
    where: eq(chat_conversation_file.chat_conversation_id, chat_id),
    with: {
      neptun_user_file: true,
    },
    columns: {
      id: true,
      neptun_user_id: true,
      chat_conversation_id: true,
      chat_conversation_message_id: true,
      created_at: true,
      updated_at: true,
    },
  })
    .catch((error) => {
      if (LOG_BACKEND) {
        const errorMessage = error instanceof Error
          ? error.message
          : 'Unknown error occurred'
        console.error('Failed to read chat conversation files from database:', errorMessage)
      }
      return null
    })

  if (!chatConversationFiles) {
    return null
  }

  // Transform the data to match the expected format
  return chatConversationFiles.map((file) => {
    if (!file.neptun_user_file) {
      throw new Error('Neptune user file not found')
    }

    return {
      ...file,
      title: file.neptun_user_file.title,
      text: file.neptun_user_file.text,
      language: file.neptun_user_file.language,
      extension: file.neptun_user_file.extension,
    }
  })
}
