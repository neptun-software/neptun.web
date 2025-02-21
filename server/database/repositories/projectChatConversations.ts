import type { ReadChatConversation, ReadProject } from '../../../lib/types/database.tables/schema'
import { and, eq } from 'drizzle-orm'
import { chat_conversation, project_chat_conversation } from '../../../lib/types/database.tables/schema'

export async function createProjectChatConversation(
  project_id: ReadProject['id'],
  chat_conversation_id: ReadChatConversation['id'],
) {
  const created = await db
    .insert(project_chat_conversation)
    .values({
      project_id,
      chat_conversation_id,
    })
    .returning()
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to create project chat conversation:', err)
      }
      return null
    })

  if (!created) {
    return null
  }

  const conversation = await db
    .select()
    .from(chat_conversation)
    .where(eq(chat_conversation.id, chat_conversation_id))
    .limit(1)
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to read chat conversation:', err)
      }
      return null
    })

  if (!conversation) {
    return null
  }
  return conversation[0]
}

export async function readAllProjectChatConversations(project_id: ReadProject['id']) {
  const conversations = await db
    .select({
      id: chat_conversation.id,
      name: chat_conversation.name,
      model: chat_conversation.model,
      created_at: chat_conversation.created_at,
      updated_at: chat_conversation.updated_at,
      neptun_user_id: chat_conversation.neptun_user_id,
    })
    .from(project_chat_conversation)
    .innerJoin(
      chat_conversation,
      eq(project_chat_conversation.chat_conversation_id, chat_conversation.id),
    )
    .where(eq(project_chat_conversation.project_id, project_id))
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to read project chat conversations:', err)
      }
      return null
    })

  if (!conversations) {
    return null
  }
  return conversations
}

export async function readProjectChatConversation(
  project_id: ReadProject['id'],
  chat_conversation_id: ReadChatConversation['id'],
) {
  const conversation = await db
    .select({
      id: chat_conversation.id,
      name: chat_conversation.name,
      model: chat_conversation.model,
      created_at: chat_conversation.created_at,
      updated_at: chat_conversation.updated_at,
      neptun_user_id: chat_conversation.neptun_user_id,
    })
    .from(project_chat_conversation)
    .innerJoin(
      chat_conversation,
      eq(project_chat_conversation.chat_conversation_id, chat_conversation.id),
    )
    .where(
      and(
        eq(project_chat_conversation.project_id, project_id),
        eq(project_chat_conversation.chat_conversation_id, chat_conversation_id),
      ),
    )
    .limit(1)
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to read project chat conversation:', err)
      }
      return null
    })

  if (!conversation) {
    return null
  }
  return conversation[0]
}

export async function deleteProjectChatConversation(
  project_id: ReadProject['id'],
  chat_conversation_id: ReadChatConversation['id'],
) {
  return db
    .delete(project_chat_conversation)
    .where(
      and(
        eq(project_chat_conversation.project_id, project_id),
        eq(project_chat_conversation.chat_conversation_id, chat_conversation_id),
      ),
    )
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to delete project chat conversation:', err)
      }
      return false
    })
}
