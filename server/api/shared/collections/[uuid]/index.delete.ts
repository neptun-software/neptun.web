import { deleteTemplateCollection } from '~/server/database/repositories/userTemplateCollections'

// Delete template Collection
export default defineEventHandler(async (event) => {
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
