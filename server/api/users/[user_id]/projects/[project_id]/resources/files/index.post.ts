import { InsertContextFileSchema } from '~/lib/types/database.tables/schema'
import { createContextFile } from '~/server/database/repositories/projectContextFiles'
import { validateParamProjectId } from '~/server/utils/validate'

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
  const { user_id, project_id } = maybeProjectId.data

  /* VALIDATE BODY */
  const body = await readValidatedBody(event, (body) => {
    return InsertContextFileSchema.safeParse(body)
  })
  if (!body.success || !body.data) {
    return sendError(
      event,
      createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'Invalid body for context file',
        data: body.error,
      }),
    )
  }

  /* CREATE CONTEXT FILE */
  try {
    const contextFile = await createContextFile({
      ...body.data,
      neptun_user_id: user_id,
      project_id,
    })

    if (!contextFile) {
      return sendError(
        event,
        createError({
          statusCode: 500,
          statusMessage: 'Internal Server Error.',
          message: 'Failed to create context file.',
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
        message: 'Failed to create context file.',
        data: error,
      }),
    )
  }
})
