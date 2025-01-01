import { eq } from 'drizzle-orm'
import {
  type GetGithubAppInstallationRepository,
  github_app_installation_repository,
  type NewGithubAppInstallationRepository,
} from '~/lib/types/database.tables/schema'

export async function createGithubAppInstallationRepositories(installation_repository_list: NewGithubAppInstallationRepository[]) {
  const createdGithubAppInstallationRepositories = await db
    .insert(github_app_installation_repository)
    .values(installation_repository_list)
    .returning()
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error(
          'Failed to create github app installation repositories in database',
          err,
        )
      }
      return null
    })

  if (!createdGithubAppInstallationRepositories) {
    return null
  }

  return createdGithubAppInstallationRepositories
}

export async function readAllGithubAppInstallationRepositoriesOfInstallation(installation_id: GetGithubAppInstallationRepository['github_app_installation_id']) {
  const fetchedGithubAppInstallationRepositories = await db
    .select()
    .from(github_app_installation_repository)
    .where(
      eq(
        github_app_installation_repository.github_app_installation_id,
        installation_id,
      ),
    )
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error(
          'Failed to fetch github app installation repositories from database',
          err,
        )
      }
      return null
    })

  if (!fetchedGithubAppInstallationRepositories) {
    return null
  }

  return fetchedGithubAppInstallationRepositories
}
