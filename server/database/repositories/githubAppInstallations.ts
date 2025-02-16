import type { NewGithubAppInstallation, ReadUser } from '~/lib/types/database.tables/schema'
import { eq } from 'drizzle-orm'
import {
  github_app_installation,

} from '~/lib/types/database.tables/schema'

export async function createGithubAppInstallation(installation_entry: NewGithubAppInstallation) {
  const createdGithubAppInstallation = await db
    .insert(github_app_installation)
    .values(installation_entry)
    .returning()
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error(
          'Failed to create github app installation in database',
          err,
        )
      }
      return null
    })

  if (!createdGithubAppInstallation) {
    return null
  }

  return createdGithubAppInstallation[0]
}

// User can have multiple, because user can link multiple github organizations.
export async function readAllGithubAppInstallationsOfUser(user_id: ReadUser['id']) {
  const fetchedGithubAppInstallations = await db
    .select({
      id: github_app_installation.id,
      github_account_name: github_app_installation.github_account_name,
      github_account_type: github_app_installation.github_account_type,
      github_account_avatar_url:
        github_app_installation.github_account_avatar_url,
      created_at: github_app_installation.created_at,
      updated_at: github_app_installation.updated_at,
    })
    .from(github_app_installation)
    .where(eq(github_app_installation.neptun_user_id, user_id))
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error(
          'Failed to fetch github app installations from database',
          err,
        )
      }
      return null
    })

  if (!fetchedGithubAppInstallations) {
    return null
  }

  return fetchedGithubAppInstallations
}
