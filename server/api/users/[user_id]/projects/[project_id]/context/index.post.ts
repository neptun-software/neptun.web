import type { ProjectPromptContext } from '~/lib/types/database.tables/schema'
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

  const body = await readBody<{ context?: ProjectPromptContext }>(event)
  const context = body?.context

  const updatedContext = await updateProjectContext(user_id, project_id, context)
  if (!updatedContext) {
    return sendError(
      event,
      createError({
        statusCode: 500,
        statusMessage: 'Failed to update project context',
      }),
    )
  }

  return {
    context: updatedContext,
  }
})
