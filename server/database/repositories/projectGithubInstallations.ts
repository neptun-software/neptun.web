import type { GetGithubAppInstallation, ReadProject, ReadUser } from '../../../lib/types/database.tables/schema'
import { and, eq } from 'drizzle-orm'
import { project_github_installation } from '../../../lib/types/database.tables/schema'

export async function createProjectGithubInstallation(
  project_id: ReadProject['id'],
  github_installation_id: GetGithubAppInstallation['id'],
) {
  const created = await db
    .insert(project_github_installation)
    .values({
      project_id,
      github_installation_id,
    })
    .returning()
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to create project github installation:', err)
      }
      return null
    })

  if (!created) {
    return null
  }
  return created[0]
}

export async function readAllProjectGithubInstallations(project_id: ReadProject['id']) {
  const installations = await db
    .select()
    .from(project_github_installation)
    .where(eq(project_github_installation.project_id, project_id))
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to read project github installations:', err)
      }
      return null
    })

  if (!installations) {
    return null
  }
  return installations
}

export async function readProjectGithubInstallation(
  project_id: ReadProject['id'],
  github_installation_id: GetGithubAppInstallation['id'],
) {
  const installation = await db
    .select()
    .from(project_github_installation)
    .where(
      and(
        eq(project_github_installation.project_id, project_id),
        eq(project_github_installation.github_installation_id, github_installation_id),
      ),
    )
    .limit(1)
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to read project github installation:', err)
      }
      return null
    })

  if (!installation) {
    return null
  }
  return installation[0]
}

export async function deleteProjectGithubInstallation(
  project_id: ReadProject['id'],
  github_installation_id: GetGithubAppInstallation['id'],
) {
  return db
    .delete(project_github_installation)
    .where(
      and(
        eq(project_github_installation.project_id, project_id),
        eq(project_github_installation.github_installation_id, github_installation_id),
      ),
    )
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to delete project github installation:', err)
      }
      return false
    })
}
