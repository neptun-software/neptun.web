import { readAllGithubAppInstallationRepositoriesOfInstallation } from '~/server/database/repositories/githubAppInstallationsRepositories';

export default defineEventHandler(async (event) => {
  /* VALIDATE PARAMS */
  const maybeInstallationId = await validateParamInstallationId(event);
  if (maybeInstallationId.statusCode !== 200) {
    return sendError(
      event,
      createError({
        statusCode: maybeInstallationId.statusCode,
        statusMessage: maybeInstallationId.statusMessage,
        data: maybeInstallationId.data
      })
    );
  }
  const installation_id = maybeInstallationId.data?.installation_id;

  const githubAppInstallationRepositories
    = await readAllGithubAppInstallationRepositoriesOfInstallation(
      installation_id
    );

  return githubAppInstallationRepositories;
})
