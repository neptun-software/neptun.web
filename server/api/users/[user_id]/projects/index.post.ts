import { InsertProjectSchema } from '~/lib/types/database.tables/schema'
import { createProject } from '~/server/database/repositories/userProjects'
import { validateParamUserId } from '~/server/utils/validate'

export default defineEventHandler(async (event) => {
  /* VALIDATE PARAMS */
  const maybeUserId = await validateParamUserId(event)
  if (maybeUserId.statusCode !== 200) {
    return sendError(
      event,
      createError({
        statusCode: maybeUserId.statusCode,
        statusMessage: maybeUserId.statusMessage,
        data: maybeUserId.data,
      }),
    )
  }
  const user_id = maybeUserId.data.user_id

  /* VALIDATE BODY */
  const body = await readValidatedBody(event, (body) => {
    return InsertProjectSchema.safeParse(body)
  })
  if (!body.success || !body.data) {
    return sendError(
      event,
      createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'Invalid body({ name, description, type, main_language })',
        data: body.error,
      }),
    )
  }

  /* CREATE PROJECT */
  try {
    const project = await createProject({
      ...body.data,
      neptun_user_id: user_id,
    })

    if (!project) {
      return sendError(
        event,
        createError({
          statusCode: 500,
          statusMessage: 'Internal Server Error. Failed to create project.',
        }),
      )
    } else {
      return project
    }
  } catch (error) {
    return sendError(
      event,
      createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error. Failed to create project.',
      }),
    )
  }
})
