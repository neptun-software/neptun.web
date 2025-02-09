import { InsertProjectSchema } from '~/lib/types/database.tables/schema'
import { updateProject } from '~/server/database/repositories/userProjects'
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
  const user_id = maybeProjectId.data.user_id
  const project_id = maybeProjectId.data.project_id

  /* VALIDATE BODY */
  const body = await readValidatedBody(event, (body) => {
    return InsertProjectSchema.partial().safeParse(body)
  })
  if (!body.success || !body.data) {
    return sendError(
      event,
      createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'Invalid body({ name?, description?, type?, main_language? })',
        data: body.error,
      }),
    )
  }

  /* UPDATE PROJECT */
  try {
    const project = await updateProject(
      user_id,
      project_id,
      body.data,
    )

    if (!project) {
      return sendError(
        event,
        createError({
          statusCode: 500,
          statusMessage: 'Internal Server Error. Failed to update project.',
        }),
      )
    }

    return project
  } catch (error) {
    return sendError(
      event,
      createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error. Failed to update project.',
      }),
    )
  }
})
