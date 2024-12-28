import { InsertTemplateSchema, InsertUserFileSchema } from '~/lib/types/database.tables/schema'
import { updateTemplate } from '~/server/database/repositories/userTemplates'

export default defineEventHandler(async (event) => {
  const maybeTemplateId = await validateParamTemplateId(event)
  if (maybeTemplateId.statusCode !== 200) {
    return sendError(
      event,
      createError({
        statusCode: maybeTemplateId.statusCode,
        statusMessage: maybeTemplateId.statusMessage,
        data: maybeTemplateId.data,
      }),
    )
  }
  const { id } = maybeTemplateId.data

  /* VALIDATE BODY */
  const body = await readValidatedBody(event, (body) => {
    if (typeof body !== 'object' || !(body && 'file' in body)) {
      return sendError(
        event,
        createError({
          statusCode: 400,
          statusMessage: 'Bad Request',
          message: 'File is required',
        }),
      )
    }

    const templateValidation = InsertTemplateSchema.partial().safeParse(body)
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
