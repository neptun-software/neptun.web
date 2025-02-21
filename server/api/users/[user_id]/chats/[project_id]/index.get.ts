import { readAllChatConversationsOfUser } from '~/server/database/repositories/chatConversations'

export default defineEventHandler(async (event) => {
  /* VALIDATE PARAMS */
  const maybeProjectId = await validateParamProjectId(event)
  if (maybeProjectId.statusCode !== 200) {
    return sendError(
      event,
      createError({
        statusCode: maybeProjectId.statusCode,
        statusMessage: maybeProjectId.statusMessage,
        data: maybeProjectId.data,
      }),
    )
  }
  const user_id = maybeProjectId.data.user_id
  const project_id = maybeProjectId.data.project_id

  /* READ ALL CHATS */
  const maybeOrderBy = await validateQueryOrderBy(event)
  if (maybeOrderBy.statusCode !== 200) {
    return sendError(
      event,
      createError({
        statusCode: maybeOrderBy.statusCode,
        statusMessage: maybeOrderBy.statusMessage,
        data: maybeOrderBy.data,
      }),
    )
  }
  const order_by = maybeOrderBy.data?.order_by

  if (LOG_BACKEND) {
    console.info(
      `fetching all chats of user ${user_id} with order_by(${order_by})...`,
    )
  }

  const fetchedChatConversations = await readAllChatConversationsOfUser(
    user_id,
    order_by,
    project_id,
  )

  return {
    chats: fetchedChatConversations,
  }
})
