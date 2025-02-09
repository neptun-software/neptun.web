import { deleteContextFile } from '~/server/database/repositories/projectContextFiles'
import { validateParamContextFileId } from '~/server/utils/validate'

export default defineEventHandler(async (event) => {
  /* VALIDATE PARAMS */
  const maybeContextFileId = await validateParamContextFileId(event)
  if (maybeContextFileId.statusCode !== 200) {
    return sendError(
      event,
      createError({
        statusCode: maybeContextFileId.statusCode,
        statusMessage: maybeContextFileId.statusMessage,
        data: maybeContextFileId.data,
      }),
    )
  }
  const { context_file_id } = maybeContextFileId.data

  /* DELETE CONTEXT FILE */
  try {
    const deleted = await deleteContextFile(context_file_id)

    if (!deleted) {
      return sendError(
        event,
        createError({
          statusCode: 404,
          statusMessage: 'Not Found.',
          message: 'Context file not found.',
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
        message: 'Failed to delete context file.',
        data: error,
      }),
    )
  }
})
