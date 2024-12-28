import { InsertTemplateCollectionSchema } from '~/lib/types/database.tables/schema'
import { updateTemplateCollection } from '~/server/database/repositories/userTemplateCollections'

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
  const { user_id, uuid } = maybeCollectionUuid.data

  /* VALIDATE BODY */
  const body = await readValidatedBody(event, (body) => {
    return InsertTemplateCollectionSchema.safeParse(body)
  })
  if (!body.success || !body.data) {
    return sendError(
      event,
      createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'Invalid body({ name?, description?, is_shared? })',
        data: body.error,
      }),
    )
  }

  try {
    const collection = await updateTemplateCollection(
      uuid,
      {
        ...body.data,
        neptun_user_id: user_id,
      },
    )

    return { collection }
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
