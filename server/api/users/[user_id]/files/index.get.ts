import { readAllUserFiles } from '~/server/database/repositories/userFiles'

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

  const userFiles = await readAllUserFiles(user_id)

  return userFiles
})
