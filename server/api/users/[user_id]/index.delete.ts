import { deleteUser } from '~/server/database/repositories/users'

// Delete user
export default defineEventHandler(async (event) => {
  /* VALIDATE PARAMS */
  const maybeUserId = await validateParamUserId(event)
  if (maybeUserId.statusCode !== 200) {
    return sendError(
      event,
      createError({
        statusCode: maybeUserId.statusCode,
        statusMessage: maybeUserId.statusMessage,
        data: maybeUserId.data,
      }),
    )
  }
  const user_id = maybeUserId.data?.user_id

  const deletionSuccessful = await deleteUser(user_id)
  if (deletionSuccessful) {
    await clearUserSession(event)
  }

  return deletionSuccessful
})
