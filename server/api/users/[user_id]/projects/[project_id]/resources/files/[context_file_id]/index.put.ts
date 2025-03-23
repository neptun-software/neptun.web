import { UpdateContextFileSchema } from '~/lib/types/database.tables/schema'
import { updateContextFile } from '~/server/database/repositories/projectContextFiles'

export default defineEventHandler(async (event) => {
  /* VALIDATE PARAMS */
  const maybeContextFileId = await validateParamProjectContextFileId(event)
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

  /* VALIDATE BODY */
  const body = await readValidatedBody(event, (body) => {
    return UpdateContextFileSchema.safeParse(body)
  })
  if (!body.success || !body.data) {
    return sendError(
      event,
      createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'Invalid body for context file update',
        data: body.error,
      }),
    )
  }

  /* UPDATE CONTEXT FILE */
  try {
    const contextFile = await updateContextFile(
      context_file_id,
      body.data,
    )

    if (!contextFile) {
      return sendError(
        event,
        createError({
          statusCode: 404,
          statusMessage: 'Not Found.',
          message: 'Context file not found.',
        }),
      )
    }

    return contextFile
  } catch (error) {
    return sendError(
      event,
      createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error.',
        message: 'Failed to update context file.',
        data: error,
      }),
    )
  }
})
