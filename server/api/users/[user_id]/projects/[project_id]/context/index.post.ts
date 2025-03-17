import { updateProjectContext } from '~/server/database/repositories/projectContext'

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

  try {
    const updatedContext = await updateProjectContext(user_id, project_id)
    if (!updatedContext) {
      return sendError(
        event,
        createError({
          statusCode: 500,
          statusMessage: 'Failed to generate project context',
        }),
      )
    }

    return {
      context: updatedContext,
    }
  } catch (error) {
    console.error('Error generating project context:', error)
    return sendError(
      event,
      createError({
        statusCode: 500,
        statusMessage: error instanceof Error ? error.message : 'Failed to generate project context',
      }),
    )
  }
})
