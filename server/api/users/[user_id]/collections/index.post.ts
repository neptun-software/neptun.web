import { InsertTemplateCollectionSchema } from '~/lib/types/database.tables/schema'
import { createTemplateCollection } from '~/server/database/repositories/userTemplateCollections'

// Create a new user template collection
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
        message: 'Invalid body({ name, description?, is_shared? })',
        data: body.error,
      }),
    )
  }

  try {
    const collection = await createTemplateCollection({
      ...body.data,
      neptun_user_id: user_id,
    })

    return { collection }
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
