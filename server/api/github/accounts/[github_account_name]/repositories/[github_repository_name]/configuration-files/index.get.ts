import type { GitHubResponse } from '~/server/api/github/(shared)/file'
import { graphql } from '@octokit/graphql'
import { CONFIG_FILES_QUERY, handleGitHubError, processEntries } from '~/server/api/github/(shared)/file'
import { validateParamGithubRepositoryName } from '~/server/utils/validate'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)

  if (!session?.user) {
    return sendError(event, createError({
      statusCode: 401,
      statusMessage: 'You must be logged in to access this endpoint',
    }))
  }

  event.context.user = session.user
  const validationResult = await validateParamGithubRepositoryName(event)
  if (validationResult.statusCode !== 200) {
    return sendError(event, createError({
      statusCode: validationResult.statusCode,
      statusMessage: validationResult.message,
      data: validationResult.data,
    }))
  }

  const { github_account_name, github_repository_name } = validationResult.data

  try {
    let graphqlWithAuth = graphql.defaults({
      headers: {
        'user-agent': 'neptun-config-file-fetcher/1.0',
      },
    })

    try {
      const result = await graphqlWithAuth<GitHubResponse>(CONFIG_FILES_QUERY, {
        owner: github_account_name,
        name: github_repository_name,
      })

      const repository = result.repository
      if (!repository?.defaultBranchRef?.target) {
        return sendError(event, createError({
          statusCode: 404,
          statusMessage: 'Repository content not accessible',
        }))
      }

      const commit = repository.defaultBranchRef.target
      const entries = commit.tree?.entries

      if (!entries || entries.length === 0) {
        return {
          repository: github_repository_name,
          config_files: [],
        }
      }

      const configFiles = processEntries(entries)

      return {
        repository: github_repository_name,
        config_files: configFiles,
      }
    } catch (noTokenError) {
      if (process.env.GITHUB_TOKEN) {
        graphqlWithAuth = graphql.defaults({
          headers: {
            'authorization': `bearer ${process.env.GITHUB_TOKEN}`,
            'user-agent': 'neptun-config-file-fetcher/1.0',
          },
        })

        const result = await graphqlWithAuth<GitHubResponse>(CONFIG_FILES_QUERY, {
          owner: github_account_name,
          name: github_repository_name,
        })

        const repository = result.repository
        if (!repository?.defaultBranchRef?.target) {
          return sendError(event, createError({
            statusCode: 404,
            statusMessage: 'Repository content not accessible',
          }))
        }

        const commit = repository.defaultBranchRef.target
        const entries = commit.tree?.entries

        if (!entries || entries.length === 0) {
          return {
            repository: github_repository_name,
            config_files: [],
          }
        }

        const configFiles = processEntries(entries)

        return {
          repository: github_repository_name,
          config_files: configFiles,
        }
      } else {
        if (noTokenError instanceof Error) {
          const errorMessage = noTokenError.message.toLowerCase()

          if (errorMessage.includes('bad credentials') || errorMessage.includes('not found')) {
            return sendError(event, createError({
              statusCode: 404,
              statusMessage: 'Repository not found or requires authentication.',
            }))
          }
        }
        throw noTokenError
      }
    }
  } catch (error) {
    const githubError = handleGitHubError(error)
    return sendError(event, githubError)
  }
})
