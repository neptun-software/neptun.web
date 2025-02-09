import { deleteResource } from '~/server/database/repositories/projectResources'
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

  /* DELETE RESOURCE */
  try {
    const deleted = await deleteResource(project_id, resource_type, resource_id)

    if (!deleted) {
      return sendError(
        event,
        createError({
          statusCode: 404,
          statusMessage: 'Not Found.',
          message: `${resource_type} with id ${resource_id} not found for project ${project_id}.`,
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
        message: `Failed to delete ${resource_type}.`,
        data: error,
      }),
    )
  }
})
