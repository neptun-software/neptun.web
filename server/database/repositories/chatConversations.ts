import { asc, desc, eq, inArray } from 'drizzle-orm'
import {
  chat_conversation,
  type ChatConversationToCreate,
  type ReadChatConversation,
  type ReadUser,
} from '../../../lib/types/database.tables/schema'

export async function createChatConversation(
  conversation: ChatConversationToCreate,
) {
  const createdChatConversation = await db
    .insert(chat_conversation)
    .values(conversation)
    .returning()
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to insert chat conversation into database', err)
      }
      return null
    })

  if (!createdChatConversation) {
    return null
  }

  return createdChatConversation[0]
}

// Options for dynamic query building:
// 1. https://orm.drizzle.team/docs/sql#sqlappend
// 2. https://orm.drizzle.team/docs/dynamic-query-building
// 2.5. https://github.com/drizzle-team/drizzle-orm/issues/1644#issuecomment-1893746141
export async function readAllChatConversationsOfUser(
  user_id: ReadUser['id'],
  order_by?: string,
) {
  let query = db
    .select()
    .from(chat_conversation)
    .where(eq(chat_conversation.neptun_user_id, user_id))
    .$dynamic()

  if (order_by) {
    const orders = parseOrderByString(order_by)
    const orderConditions = orders.map((order) => {
      return order.direction === 'asc'
        ? asc(chat_conversation[order.column])
        : desc(chat_conversation[order.column])
    })
    query = query.orderBy(...orderConditions)
  } else {
    query = query.orderBy(
      desc(chat_conversation.updated_at),
      desc(chat_conversation.name),
    )
  }

  const fetchedChatConversations = await query.catch((err) => {
    if (LOG_BACKEND) {
      console.error('Failed to fetch chat conversations from database', err)
    }
    return null
  })

  if (!fetchedChatConversations) {
    return null
  }

  return fetchedChatConversations
}

export async function updateChatConversation(
  id: ReadChatConversation['id'],
  fields: Partial<
    Omit<
      ReadChatConversation,
      'id' | 'model' | 'created_at' | 'updated_at' | 'neptun_user_id'
    >
  >,
) {
  const updatedChatConversation = await db
    .update(chat_conversation)
    .set(fields)
    .where(eq(chat_conversation.id, id))
    .returning()
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to update chat conversation in database', err)
      }
      return null
    })

  if (!updatedChatConversation) {
    return null
  }

  return updatedChatConversation[0]
}

export async function deleteChatConversation(id: ReadChatConversation['id']) {
  const successfullyDeleted = await db
    .delete(chat_conversation)
    .where(eq(chat_conversation.id, id))
    .then(() => true)
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to delete chat conversation from database', err)
      }
      return false
    })

  return successfullyDeleted
}

export async function deleteChatConversations(
  ids: ReadChatConversation['id'][],
) {
  const successfullyDeleted = await db
    .delete(chat_conversation)
    .where(inArray(chat_conversation.id, ids))
    .then(() => true)
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to delete chat conversation from database', err)
      }
      return false
    })

  return successfullyDeleted
}
