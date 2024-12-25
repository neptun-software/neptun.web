import { deleteTemplate } from '~/server/database/repositories/userTemplates'

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

  try {
    await deleteTemplate(id)
    return { success: true }
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
