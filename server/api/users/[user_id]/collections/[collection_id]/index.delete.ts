import { deleteTemplateCollection } from '~/server/database/repositories/userTemplateCollections'
import { validateParamCollectionId } from '~/server/utils/validate'

// Delete template Collection
export default defineEventHandler(async (event) => {
  /* VALIDATE PARAMS */
  const maybeCollectionId = await validateParamCollectionId(event)
  if (maybeCollectionId.statusCode !== 200) {
    return sendError(
      event,
      createError({
        statusCode: maybeCollectionId.statusCode,
        statusMessage: maybeCollectionId.statusMessage,
        data: maybeCollectionId.data,
      }),
    )
  }
  const { collection_id } = maybeCollectionId.data

  try {
    return await deleteTemplateCollection(collection_id)
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
