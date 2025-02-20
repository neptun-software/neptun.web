import { readContextFilesByCategoryAndType, readContextFilesByProjectId } from '~/server/database/repositories/projectContextFiles'
import { validateParamProjectId, validateQueryContextFile } from '~/server/utils/validate'

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
  const { project_id } = maybeProjectId.data

  /* VALIDATE QUERY */
  const validatedQuery = await validateQueryContextFile(event)
  if (validatedQuery.statusCode !== 200) {
    return sendError(
      event,
      createError({
        statusCode: validatedQuery.statusCode,
        statusMessage: validatedQuery.statusMessage,
        data: validatedQuery.data,
      }),
    )
  }
  const { context_file_category, context_file_type } = validatedQuery.data

  /* READ CONTEXT FILES */
  try {
    // If no filters provided, return all files
    if (!context_file_category && !context_file_type) {
      const allFiles = await readContextFilesByProjectId(project_id)
      if (!allFiles) {
        return sendError(
          event,
          createError({
            statusCode: 404,
            statusMessage: 'Not Found.',
            message: 'Context files not found.',
          }),
        )
      }
      return allFiles
    }

    // If filters provided, use the filtered query
    const contextFiles = await readContextFilesByCategoryAndType(
      project_id,
      context_file_category || 'unknown',
      context_file_type || 'text',
    )

    if (!contextFiles) {
      return sendError(
        event,
        createError({
          statusCode: 404,
          statusMessage: 'Not Found.',
          message: 'Context files not found.',
        }),
      )
    }

    return contextFiles
  } catch (error) {
    return sendError(
      event,
      createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error.',
        message: 'Failed to read context files.',
        data: error,
      }),
    )
  }
})
