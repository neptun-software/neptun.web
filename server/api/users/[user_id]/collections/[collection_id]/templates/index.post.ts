import { InsertTemplateSchema, InsertUserFileSchema } from '~/lib/types/database.tables/schema'
import { readTemplateCollection } from '~/server/database/repositories/userTemplateCollections'
import { createTemplate } from '~/server/database/repositories/userTemplates'
import { validateParamCollectionId } from '~/server/utils/validate'

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
  const { user_id, collection_id } = maybeCollectionId.data

  /* VALIDATE BODY */
  const body = await readValidatedBody(event, (body) => {
    if (!body || typeof body !== 'object' || !('template' in body) || !('file' in body)) {
      return sendError(
        event,
        createError({
          statusCode: 400,
          statusMessage: 'Bad Request',
          message: 'Invalid body format. Expected { template, file }',
        }),
      )
    }

    const templateValidation = InsertTemplateSchema.safeParse(body.template)
    const fileValidation = InsertUserFileSchema.safeParse(body.file)

    if (!templateValidation.success || !fileValidation.success) {
      return sendError(
        event,
        createError({
          statusCode: 400,
          statusMessage: 'Bad Request',
          message: 'Invalid template or file data',
          data: {
            template: templateValidation.success ? null : templateValidation.error.format(),
            file: fileValidation.success ? null : fileValidation.error.format(),
          },
        }),
      )
    }

    return {
      template: templateValidation.data,
      file: fileValidation.data,
    }
  })

  // Verify collection exists
  const collection = await readTemplateCollection(collection_id, {
    user_id,
  })
  if (!collection) {
    return sendError(
      event,
      createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        message: 'Collection not found',
      }),
    )
  }

  try {
    const template = await createTemplate({
      ...body.template,
      template_collection_id: collection.id,
      file: body.file,
    })

    if (!template) {
      return sendError(
        event,
        createError({
          statusCode: 500,
          statusMessage: 'Internal Server Error',
          message: 'Failed to create template',
        }),
      )
    }

    return { template }
  } catch (error) {
    return sendError(
      event,
      createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        message: 'Failed to create template',
        data: error,
      }),
    )
  }
})
