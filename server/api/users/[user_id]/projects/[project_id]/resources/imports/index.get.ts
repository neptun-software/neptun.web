import { readContextImportsByProjectAndSourceType } from '~/server/database/repositories/projectContextImports'
import { validateParamProjectId, validateQueryImport } from '~/server/utils/validate'

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
  const validatedQuery = await validateQueryImport(event)
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
  const { import_source_type } = validatedQuery.data

  /* READ CONTEXT IMPORTS */
  try {
    const contextImports = await readContextImportsByProjectAndSourceType(
      project_id,
      import_source_type || 'local_folder',
    )

    if (!contextImports) {
      return sendError(
        event,
        createError({
          statusCode: 404,
          statusMessage: 'Not Found.',
          message: 'Context imports not found.',
        }),
      )
    }

    return contextImports
  } catch (error) {
    return sendError(
      event,
      createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error.',
        message: 'Failed to read context imports.',
        data: error,
      }),
    )
  }
})
