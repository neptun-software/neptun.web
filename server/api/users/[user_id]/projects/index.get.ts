import { readAllProjects, readProjectsByTypeAndLanguage } from '~/server/database/repositories/userProjects'
import { validateParamUserId, validateQueryProject } from '~/server/utils/validate'

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
  const user_id = maybeUserId.data?.user_id

  /* VALIDATE QUERY PARAMS */
  const validatedQuery = await validateQueryProject(event)
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
  const type = validatedQuery.data.project_type
  const main_language = validatedQuery.data.programming_language

  /* READ PROJECTS BY TYPE AND LANGUAGE */
  if (type && main_language) {
    const projects = await readProjectsByTypeAndLanguage(user_id, type, main_language)
    if (!projects) {
      return sendError(
        event,
        createError({
          statusCode: 404,
          statusMessage: 'Not Found. Projects not found.',
        }),
      )
    }
    return projects
  }

  /* READ ALL PROJECTS */
  try {
    const projects = await readAllProjects(user_id)

    if (!projects) {
      return sendError(
        event,
        createError({
          statusCode: 404,
          statusMessage: 'Not Found. Projects not found.',
        }),
      )
    }

    return projects
  } catch (error) {
    return sendError(
      event,
      createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error. Failed to read projects.',
      }),
    )
  }
})
