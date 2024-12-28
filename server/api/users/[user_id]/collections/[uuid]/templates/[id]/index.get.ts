import { readTemplate } from '~/server/database/repositories/userTemplates'

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
