import type { GitHubResponse } from '~/server/api/github/(shared)/file'
import { App } from 'octokit'
import { z } from 'zod'
import { CONFIG_FILES_QUERY, handleGitHubError, processEntries } from '~/server/api/github/(shared)/file'
import { findRepositoryInUserInstallations } from '~/server/database/repositories/githubAppInstallationsRepositories'
import { validateParamGithubRepositoryId } from '~/server/utils/validate'

// Add type for error objects
interface GitHubErrorLike {
  message?: string
  [key: string]: unknown
}

const GithubAppConfigSchema = z.object({
  app: z.object({
    webhookSecret: z.string(),
    appId: z.string(),
    clientId: z.string(),
    clientSecret: z.string(),
    privateKey: z.string(),
  }),
})

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)

  if (!session?.user) {
    return sendError(event, createError({
      statusCode: 401,
      statusMessage: 'You must be logged in to access this endpoint',
    }))
  }

  event.context.user = session.user
  const validationResult = await validateParamGithubRepositoryId(event)
  if (validationResult.statusCode !== 200) {
    return sendError(event, createError({
      statusCode: validationResult.statusCode,
      statusMessage: validationResult.message,
      data: validationResult.data,
    }))
  }

  const { github_account_id, github_repository_id } = validationResult.data

  try {
    // Step 1: Find the installation and repository
    const installationInfo = await findRepositoryInUserInstallations(
      session.user.id,
      github_account_id,
      github_repository_id,
    )

    if (!installationInfo) {
      console.log('No installation info found')
      return sendError(event, createError({
        statusCode: 404,
        statusMessage: 'GitHub App installation not found for this repository. Please install the GitHub App first.',
      }))
    }

    console.log('Found installation:', {
      installation_id: installationInfo.installation.id,
      account_name: installationInfo.installation.github_account_name,
      repo_name: installationInfo.repository.github_repository_name,
    })

    if (!installationInfo.installation.github_account_name || !installationInfo.repository.github_repository_name) {
      console.log('Missing required name fields in installation or repository')
      return sendError(event, createError({
        statusCode: 404,
        statusMessage: 'GitHub App installation data incomplete. Missing account or repository name.',
      }))
    }

    // Step 2: Initialize the GitHub App client
    const runtimeConfig = useRuntimeConfig(event)
    const { app } = GithubAppConfigSchema.parse(runtimeConfig?.github)

    console.log('Initializing GitHub App')
    const octokitApp = new App({
      appId: app.appId,
      privateKey: app.privateKey,
      oauth: {
        clientId: app.clientId,
        clientSecret: app.clientSecret,
      },
      webhooks: {
        secret: app.webhookSecret,
      },
    })

    try {
      // Step 3: Get an authenticated Octokit instance for the installation
      console.log('Getting installation Octokit for ID:', installationInfo.installation.github_installation_id)
      let octokit
      try {
        octokit = await octokitApp.getInstallationOctokit(installationInfo.installation.github_installation_id)
      } catch (tokenError) {
        const error = tokenError as GitHubErrorLike
        console.error('Failed to get installation token:', error?.message || 'Unknown error')

        // Check if this is an installation token issue
        const errorMessage = error?.message
        if (typeof errorMessage === 'string'
          && errorMessage.toLowerCase().includes('not found')
          && errorMessage.toLowerCase().includes('create-an-installation-access-token')) {
          return sendError(event, createError({
            statusCode: 404,
            statusMessage: 'GitHub App installation no longer exists. The app may have been uninstalled from GitHub. Please reinstall the GitHub App.',
          }))
        }

        throw tokenError
      }

      // Step 3.5: Verify the GitHub App installation can access the repository
      console.log('Verifying repository access...')
      try {
        // Simple API call to check if we can access the repository
        await octokit.rest.repos.get({
          owner: installationInfo.installation.github_account_name,
          repo: installationInfo.repository.github_repository_name,
        })
        console.log('Repository access verified')
      } catch (accessError) {
        const error = accessError as GitHubErrorLike
        console.error('Repository access check failed:', error?.message || 'Unknown error')
        return sendError(event, createError({
          statusCode: 404,
          statusMessage: 'GitHub App installation exists but cannot access this repository. The repository may not exist or the GitHub App installation may need additional permissions.',
        }))
      }

      // Step 4: Query GitHub for the repository content
      const graphqlWithAuth = octokit.graphql
      console.log('Querying GitHub API with:', {
        owner: installationInfo.installation.github_account_name,
        name: installationInfo.repository.github_repository_name,
      })

      const result = await graphqlWithAuth<GitHubResponse>(CONFIG_FILES_QUERY, {
        owner: installationInfo.installation.github_account_name,
        name: installationInfo.repository.github_repository_name,
      })

      // Step 5: Process the result
      const repository = result.repository
      if (!repository) {
        console.log('Repository not found in GitHub API response')
        return sendError(event, createError({
          statusCode: 404,
          statusMessage: 'Repository not found on GitHub.',
        }))
      }

      if (!repository.defaultBranchRef) {
        console.log('Default branch not found in repository')
        return sendError(event, createError({
          statusCode: 404,
          statusMessage: 'Repository has no default branch.',
        }))
      }

      if (!repository.defaultBranchRef.target) {
        console.log('Default branch has no target commit')
        return sendError(event, createError({
          statusCode: 404,
          statusMessage: 'Repository default branch has no target commit.',
        }))
      }

      const commit = repository.defaultBranchRef.target
      const entries = commit.tree?.entries

      if (!entries || entries.length === 0) {
        console.log('No files found in repository')
        return {
          repository: installationInfo.repository.github_repository_name,
          config_files: [],
        }
      }

      const configFiles = processEntries(entries)
      return {
        repository: installationInfo.repository.github_repository_name,
        config_files: configFiles,
      }
    } catch (gitHubError) {
      console.error('GitHub API error:', gitHubError)
      const error = gitHubError as GitHubErrorLike
      const errorMessage = error && typeof error === 'object' && error?.message
        ? String(error.message)
        : 'Unknown GitHub error'

      return sendError(event, createError({
        statusCode: 404,
        statusMessage: 'Repository not found or not accessible.',
        data: errorMessage,
      }))
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    const githubError = handleGitHubError(error)
    return sendError(event, githubError)
  }
})
