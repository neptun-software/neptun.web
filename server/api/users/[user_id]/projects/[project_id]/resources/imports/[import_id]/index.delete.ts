import { deleteContextImport } from '~/server/database/repositories/projectContextImports'

export default defineEventHandler(async (event) => {
  /* VALIDATE PARAMS */
  const maybeImportId = await validateParamProjectImportId(event)
  if (maybeImportId.statusCode !== 200) {
    return sendError(
      event,
      createError({
        statusCode: maybeImportId.statusCode,
        statusMessage: maybeImportId.statusMessage,
        data: maybeImportId.data,
      }),
    )
  }
  const { import_id } = maybeImportId.data

  /* DELETE CONTEXT IMPORT */
  try {
    const deleted = await deleteContextImport(import_id)

    if (!deleted) {
      return sendError(
        event,
        createError({
          statusCode: 404,
          statusMessage: 'Not Found.',
          message: 'Context import not found.',
        }),
      )
    }

    return deleted
  } catch (error) {
    return sendError(
      event,
      createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error.',
        message: 'Failed to delete context import.',
        data: error,
      }),
    )
  }
})
