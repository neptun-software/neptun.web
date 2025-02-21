import { deleteGithubAppInstallation } from '~/server/database/repositories/githubAppInstallations'
import { validateParamInstallationId } from '~/server/utils/validate'

export default defineEventHandler(async (event) => {
  /* VALIDATE PARAMS */
  const maybeInstallationId = await validateParamInstallationId(event)
  if (maybeInstallationId.statusCode !== 200) {
    return sendError(
      event,
      createError({
        statusCode: maybeInstallationId.statusCode,
        statusMessage: maybeInstallationId.statusMessage,
        data: maybeInstallationId.data,
      }),
    )
  }
  const user_id = maybeInstallationId.data.user_id
  const installation_id = maybeInstallationId.data.installation_id

  /* DELETE INSTALLATION */
  try {
    return await deleteGithubAppInstallation(user_id, installation_id)
  } catch (error) {
    return sendError(
      event,
      createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error. Failed to delete GitHub app installation.',
        data: error,
      }),
    )
  }
})
