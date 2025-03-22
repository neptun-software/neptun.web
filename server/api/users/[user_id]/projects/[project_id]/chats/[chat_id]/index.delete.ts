import { createError, defineEventHandler, sendError } from 'h3'
import { deleteChatConversation } from '~/server/database/repositories/chatConversations'
import { deleteResource } from '~/server/database/repositories/projectResources'
import { validateParamProjectChatId } from '~/server/utils/validate'

// Delete chat conversation
export default defineEventHandler(async (event) => {
  /* VALIDATE PARAMS */
  const maybeParams = await validateParamProjectChatId(event)
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
  const { project_id, chat_id } = maybeParams.data

  try {
    // First remove from project, then delete the chat
    const resourceDeleted = await deleteResource(project_id, 'chat-conversations', chat_id)
    if (!resourceDeleted) {
      return sendError(
        event,
        createError({
          statusCode: 500,
          statusMessage: 'Failed to remove chat from project',
        }),
      )
    }

    const chatDeleted = await deleteChatConversation(chat_id)
    if (!chatDeleted) {
      return sendError(
        event,
        createError({
          statusCode: 500,
          statusMessage: 'Failed to delete chat conversation',
        }),
      )
    }

    return true
  } catch (error) {
    return false
  }
})
