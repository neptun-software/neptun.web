import { createError, defineEventHandler, sendError } from 'h3'
import { ChatConversationsToDelete } from '~/lib/types/database.tables/schema'
import { deleteChatConversations } from '~/server/database/repositories/chatConversations'
import { deleteResources } from '~/server/database/repositories/projectResources'
import { validateParamProjectId } from '~/server/utils/validate'

// Batch delete chat conversations
export default defineEventHandler(async (event) => {
  /* VALIDATE PARAMS */
  const maybeParams = await validateParamProjectId(event)
  if (maybeParams.statusCode !== 200) {
    return sendError(
      event,
      createError({
        statusCode: maybeParams.statusCode,
        statusMessage: maybeParams.statusMessage,
        data: maybeParams.data,
      }),
    )
  }
  const { project_id } = maybeParams.data

  /* VALIDATE BODY */
  const body = await readValidatedBody(event, body =>
    ChatConversationsToDelete.safeParse(body))
  if (!body.success || !body.data) {
    return sendError(
      event,
      createError({
        statusCode: 400,
        statusMessage: 'Bad Request. Invalid body(chat_ids).',
        data: body.error,
      }),
    )
  }
  const { chat_ids } = body.data

  try {
    // First remove all chats from project
    const resourcesDeleted = await deleteResources(project_id, 'chat-conversations', chat_ids)
    if (!resourcesDeleted) {
      return sendError(
        event,
        createError({
          statusCode: 500,
          statusMessage: 'Failed to remove chats from project',
        }),
      )
    }

    // Then delete all chats
    const chatsDeleted = await deleteChatConversations(chat_ids)
    if (!chatsDeleted) {
      return sendError(
        event,
        createError({
          statusCode: 500,
          statusMessage: 'Failed to delete chat conversations',
        }),
      )
    }

    return true
  } catch (error) {
    return false
  }
})
