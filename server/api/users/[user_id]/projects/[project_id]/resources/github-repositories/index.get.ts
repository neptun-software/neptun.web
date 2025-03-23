import { eq } from 'drizzle-orm'
import { github_app_installation, neptun_user_project, project_github_installation } from '~/lib/types/database.tables/schema'
import { readAllGithubAppInstallationRepositoriesOfInstallation } from '~/server/database/repositories/githubAppInstallationsRepositories'
import { validateParamProjectId } from '~/server/utils/validate'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)

  if (!session?.user) {
    return sendError(event, createError({
      statusCode: 401,
      statusMessage: 'You must be logged in to access this endpoint',
    }))
  }

  const validationResult = await validateParamProjectId(event)
  if (validationResult.statusCode !== 200) {
    return sendError(event, createError({
      statusCode: validationResult.statusCode,
      statusMessage: validationResult.message,
      data: validationResult.data,
    }))
  }

  const { project_id } = validationResult.data

  const project = await db.select()
    .from(neptun_user_project)
    .where(eq(neptun_user_project.id, project_id))
    .limit(1)
    .then(rows => rows[0])

  if (!project) {
    return sendError(event, createError({
      statusCode: 404,
      statusMessage: 'Project not found',
    }))
  }

  const installation = await db.select()
    .from(project_github_installation)
    .innerJoin(
      github_app_installation,
      eq(project_github_installation.github_installation_id, github_app_installation.id),
    )
    .where(eq(project_github_installation.project_id, project_id))
    .limit(1)
    .then(rows => rows[0]?.github_app_installation)

  if (!installation) {
    return sendError(event, createError({
      statusCode: 404,
      statusMessage: 'No GitHub installation found for this project',
    }))
  }

  const repositories = await readAllGithubAppInstallationRepositoriesOfInstallation(installation.id)
  if (!repositories) {
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch repositories',
    }))
  }

  const repositoriesWithInstallation = repositories.map(repo => ({
    ...repo,
    github_account_id: installation.github_account_id,
    github_account_name: installation.github_account_name,
  }))

  return { repositories: repositoriesWithInstallation }
})
