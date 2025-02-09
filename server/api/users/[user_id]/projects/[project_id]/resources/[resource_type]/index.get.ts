import { readAllResources } from '~/server/database/repositories/projectResources'
import { validateParamResourceType } from '~/server/utils/validate'

export default defineEventHandler(async (event) => {
  /* VALIDATE PARAMS */
  const maybeResourceType = await validateParamResourceType(event)
  if (maybeResourceType.statusCode !== 200) {
    return sendError(
      event,
      createError({
        statusCode: maybeResourceType.statusCode,
        statusMessage: maybeResourceType.statusMessage,
        data: maybeResourceType.data,
      }),
    )
  }
  const { project_id, resource_type } = maybeResourceType.data

  /* READ ALL RESOURCES */
  try {
    const resources = await readAllResources(project_id, resource_type)

    if (!resources) {
      return sendError(
        event,
        createError({
          statusCode: 404,
          statusMessage: 'Not Found.',
          message: `No ${resource_type} found for project ${project_id}.`,
        }),
      )
    }

    return resources
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
