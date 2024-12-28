import { deleteTemplateCollection } from '~/server/database/repositories/userTemplateCollections'

// Delete template Collection
export default defineEventHandler(async (event) => {
  /* VALIDATE PARAMS */
  const maybeCollectionUuid = await validateParamCollectionUuid(event)
  if (maybeCollectionUuid.statusCode !== 200) {
    return sendError(
      event,
      createError({
        statusCode: maybeCollectionUuid.statusCode,
        statusMessage: maybeCollectionUuid.statusMessage,
        data: maybeCollectionUuid.data,
      }),
    )
  }
  const { uuid } = maybeCollectionUuid.data

  try {
    await deleteTemplateCollection(uuid)
    return true
  } catch (error) {
    return sendError(
      event,
      createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        data: error,
      }),
    )
  }
})
