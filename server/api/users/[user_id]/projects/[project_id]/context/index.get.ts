import { readProjectContext } from '~/server/database/repositories/projectContext'

export default defineEventHandler(async (event) => {
  // Validate parameters
  const validationResult = await validateParamProjectId(event)
  if (validationResult.statusCode !== 200) {
    return sendError(
      event,
      createError({
        statusCode: validationResult.statusCode,
        statusMessage: validationResult.statusMessage,
      }),
    )
  }
  const { user_id, project_id } = validationResult.data

  const context = await readProjectContext(user_id, project_id)
  if (!context) {
    return sendError(
      event,
      createError({
        statusCode: 404,
        statusMessage: 'Project context not found',
      }),
    )
  }

  return {
    context,
  }
})
