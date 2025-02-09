import { UpdateContextImportSchema } from '~/lib/types/database.tables/schema'
import { updateContextImport } from '~/server/database/repositories/projectContextImports'
import { validateParamImportId } from '~/server/utils/validate'

export default defineEventHandler(async (event) => {
  /* VALIDATE PARAMS */
  const maybeImportId = await validateParamImportId(event)
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

  /* VALIDATE BODY */
  const body = await readValidatedBody(event, (body) => {
    return UpdateContextImportSchema.safeParse(body)
  })
  if (!body.success || !body.data) {
    return sendError(
      event,
      createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'Invalid body for context import update',
        data: body.error,
      }),
    )
  }

  /* UPDATE CONTEXT IMPORT */
  try {
    const contextImport = await updateContextImport(import_id, body.data)

    if (!contextImport) {
      return sendError(
        event,
        createError({
          statusCode: 404,
          statusMessage: 'Not Found.',
          message: 'Context import not found.',
        }),
      )
    }

    return contextImport
  } catch (error) {
    return sendError(
      event,
      createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error.',
        message: 'Failed to update context import.',
        data: error,
      }),
    )
  }
})
