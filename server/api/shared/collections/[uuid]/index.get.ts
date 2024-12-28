import { readTemplateCollection } from '~/server/database/repositories/userTemplateCollections'

// Read all files of a shared template collection
export default defineCachedEventHandler(async (event) => {
  /* VALIDATE PARAMS */
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

  const collection = await readTemplateCollection(uuid, {
    is_shared: true,
  })

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

  return { collection }
})
