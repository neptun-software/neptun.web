import type { GetGithubAppInstallationRepository, NewGithubAppInstallationRepository } from '~/lib/types/database.tables/schema'
import { eq } from 'drizzle-orm'
import {
  github_app_installation_repository,
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

export async function findRepositoryInUserInstallations(
  user_id: number,
  github_account_id: number,
  github_repository_id: number,
) {
  const installations = await db.query.github_app_installation.findMany({
    where: (installation, { eq }) => eq(installation.neptun_user_id, user_id),
    with: {
      github_app_installation_repositories: {
        where: (repository, { eq }) => eq(repository.github_repository_id, github_repository_id),
      },
    },
  })

  const validInstallations = installations.filter(
    inst => inst.github_app_installation_repositories.length > 0,
  )

  if (validInstallations.length === 0) {
    return null
  }

  const exactMatch = validInstallations.find(
    inst => inst.github_account_id === github_account_id,
  )

  const selectedInstallation = exactMatch || validInstallations[0]

  return {
    installation: selectedInstallation,
    repository: selectedInstallation.github_app_installation_repositories[0],
  }
}
