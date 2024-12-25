import { readTemplate } from '~/server/database/repositories/userTemplates'

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

  const template = await readTemplate(id)

  if (!template) {
    return sendError(
      event,
      createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        message: 'Template not found',
      }),
    )
  }

  return { template }
})
