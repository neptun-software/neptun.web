import { deleteProject } from '~/server/database/repositories/userProjects'
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

  /* DELETE PROJECT */
  try {
    return await deleteProject(user_id, project_id)
  } catch (error) {
    return sendError(
      event,
      createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error. Failed to delete project.',
        data: error,
      }),
    )
  }
})
