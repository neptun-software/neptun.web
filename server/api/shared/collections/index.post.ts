import { InsertTemplateCollectionSchema } from '~/lib/types/database.tables/schema'
import { createTemplateCollection } from '~/server/database/repositories/userTemplateCollections'

export default defineEventHandler(async (event) => {
  /* VALIDATE BODY */
  const body = await readValidatedBody(event, (body) => {
    return InsertTemplateCollectionSchema.safeParse(body)
  })
  if (!body.success || !body.data) {
    console.log(body.error)

    return sendError(
      event,
      createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'Invalid body({ name, description?, is_shared? })',
        data: body.error,
      }),
    )
  }

  try {
    const collection = await createTemplateCollection(body.data)

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
