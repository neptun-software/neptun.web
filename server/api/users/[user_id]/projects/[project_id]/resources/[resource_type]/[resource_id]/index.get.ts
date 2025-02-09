import { readResource } from '~/server/database/repositories/projectResources'
import { validateParamResourceId } from '~/server/utils/validate'

export default defineEventHandler(async (event) => {
  /* VALIDATE PARAMS */
  const maybeResourceId = await validateParamResourceId(event)
  if (maybeResourceId.statusCode !== 200) {
    return sendError(
      event,
      createError({
        statusCode: maybeResourceId.statusCode,
        statusMessage: maybeResourceId.statusMessage,
        data: maybeResourceId.data,
      }),
    )
  }
  const { project_id, resource_type, resource_id } = maybeResourceId.data

  /* READ RESOURCE */
  try {
    const resource = await readResource(project_id, resource_type, resource_id)

    if (!resource) {
      return sendError(
        event,
        createError({
          statusCode: 404,
          statusMessage: 'Not Found.',
          message: `${resource_type} with id ${resource_id} not found for project ${project_id}.`,
        }),
      )
    }

    return resource
  } catch (error) {
    return sendError(
      event,
      createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error.',
        message: `Failed to read ${resource_type}.`,
        data: error,
      }),
    )
  }
})
