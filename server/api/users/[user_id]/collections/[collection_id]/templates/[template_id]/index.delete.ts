import { deleteTemplate } from '~/server/database/repositories/userTemplates'

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
  const { template_id } = maybeTemplateId.data

  try {
    return await deleteTemplate(template_id)
  } catch (error) {
    return sendError(
      event,
      createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        message: 'Failed to delete template',
        data: error,
      }),
    )
  }
})
