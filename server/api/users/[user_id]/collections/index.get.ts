import { readAllTemplateCollections } from '~/server/database/repositories/userTemplateCollections'
import { validateQueryCollectionName } from '~/server/utils/validate'

// Read all user template collections including their files (templates)
export default defineEventHandler(async (event) => {
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

  /* VALIDATE QUERY PARAMS(name) */
  const maybeIsShared = await validateQueryIsShared(event)
  if (maybeIsShared.statusCode !== 200) {
    return sendError(
      event,
      createError({
        statusCode: maybeIsShared.statusCode,
        statusMessage: maybeIsShared.statusMessage,
        data: maybeIsShared.data,
      }),
    )
  }
  const is_shared = maybeIsShared.data?.is_shared ?? null

  const maybeName = await validateQueryCollectionName(event)
  if (maybeName.statusCode !== 200) {
    return sendError(
      event,
      createError({
        statusCode: maybeName.statusCode,
        statusMessage: maybeName.statusMessage,
        data: maybeName.data,
      }),
    )
  }
  const name = maybeName.data?.name ?? null

  try {
    const collections = await readAllTemplateCollections({
      is_shared,
      user_id,
      name,
    })

    return {
      collections,
      total: collections.length,
    }
  } catch {
    return sendError(
      event,
      createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        data: null,
      }),
    )
  }
})
