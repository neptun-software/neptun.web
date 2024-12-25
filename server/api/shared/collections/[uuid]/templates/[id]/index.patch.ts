import { InsertTemplateSchema, InsertUserFileSchema } from '~/lib/types/database.tables/schema'
import { updateTemplate } from '~/server/database/repositories/userTemplates'

export default defineEventHandler(async (event) => {
  const id = Number.parseInt(event.context.params?.id || '')
  if (Number.isNaN(id)) {
    return sendError(
      event,
      createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'Invalid template ID',
      }),
    )
  }

  /* VALIDATE BODY */
  const body = await readValidatedBody(event, (body) => {
    if (!body || typeof body !== 'object') {
      return sendError(
        event,
        createError({
          statusCode: 400,
          statusMessage: 'Bad Request',
          message: 'Invalid body format',
        }),
      )
    }

    const templateValidation = InsertTemplateSchema.partial().safeParse(body)

    if (!('file' in body)) {
      return sendError(
        event,
        createError({
          statusCode: 400,
          statusMessage: 'Bad Request',
          message: 'File is required',
        }),
      )
    }

    const fileValidation = InsertUserFileSchema.partial().safeParse(body.file)

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
      ...templateValidation.data,
      file: fileValidation.data,
    }
  })

  try {
    const template = await updateTemplate(id, body)
    return { template }
  } catch (error) {
    return sendError(
      event,
      createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        message: 'Failed to update template',
        data: error,
      }),
    )
  }
})
