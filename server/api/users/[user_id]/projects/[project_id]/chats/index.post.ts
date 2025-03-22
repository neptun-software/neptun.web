import type { ChatConversationToCreate } from '~/lib/types/database.tables/schema'
import { createError, defineEventHandler, sendError } from 'h3'
import { ChatConversationToCreateSchema } from '~/lib/types/database.tables/schema'
import { createChatConversation } from '~/server/database/repositories/chatConversations'
import { createResource } from '~/server/database/repositories/projectResources'
import { validateParamProjectId } from '~/server/utils/validate'

// Create chat conversation
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
  const { user_id, project_id } = maybeParams.data

  /* VALIDATE BODY */
  const body = await readValidatedBody(event, body =>
    ChatConversationToCreateSchema.safeParse(body))
  if (!body.success || !body.data) {
    return sendError(
      event,
      createError({
        statusCode: 400,
        statusMessage: 'Bad Request. Invalid body(model, name).',
        data: body.error,
      }),
    )
  }
  const validatedBody = body.data
  const { model, name } = validatedBody

  /* CREATE CHAT AND LINK TO PROJECT */
  if (LOG_BACKEND) {
    console.info(`creating new project chat (${JSON.stringify(validatedBody)})...`)
  }

  const chatToCreate: ChatConversationToCreate = {
    neptun_user_id: user_id,
    model,
    name,
  }

  // Create the chat
  const createdChat = await createChatConversation(chatToCreate)
  if (!createdChat) {
    return sendError(
      event,
      createError({
        statusCode: 500,
        statusMessage: 'Failed to create chat conversation',
      }),
    )
  }

  // Link chat to project
  const linkedChat = await createResource(project_id, 'chat-conversations', createdChat.id)
  if (!linkedChat) {
    return sendError(
      event,
      createError({
        statusCode: 500,
        statusMessage: 'Failed to link chat to project',
      }),
    )
  }

  return {
    chat: linkedChat,
  }
})
