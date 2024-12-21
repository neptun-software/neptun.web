import { readTemplateCollection } from '~/server/database/repositories/userTemplateCollections'

// Read all files of a shared template collection
export default defineCachedEventHandler(async (event) => {
  const maybeUuid = await validateParamUuid(event)
  if (maybeUuid.statusCode !== 200) {
    return sendError(
      event,
      createError({
        statusCode: maybeUuid.statusCode,
        statusMessage: maybeUuid.statusMessage,
        data: maybeUuid.data,
      }),
    )
  }
  const uuid = maybeUuid.data?.uuid

  const collection = await readTemplateCollection(uuid)

  if (!collection) {
    return sendError(
      event,
      createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        message: 'Template collection not found',
      }),
    )
  }

  if (!collection.is_shared) {
    return sendError(
      event,
      createError({
        statusCode: 403,
        statusMessage: 'Forbidden',
        message: 'This template collection is not shared',
      }),
    )
  }

  return {
    collection,
  }
})
