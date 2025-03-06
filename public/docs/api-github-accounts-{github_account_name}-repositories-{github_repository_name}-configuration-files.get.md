# GitHub Repository Configuration Files Endpoint

## Overview

This endpoint retrieves configuration files from a GitHub repository using the repository owner and name. It first attempts to access public repositories without authentication, then falls back to using a GitHub token if available.

## Request Details

### HTTP Method

GET

### Route

`/api/github/accounts/{github_account_name}/repositories/{github_repository_name}/configuration-files`

### Route Parameters

| Parameter              | Type   | Required | Description                          |
| ---------------------- | ------ | -------- | ------------------------------------ |
| github_account_name    | string | Yes      | The GitHub account/organization name |
| github_repository_name | string | Yes      | The GitHub repository name           |

### Headers

| Header | Value          | Required | Description                   |
| ------ | -------------- | -------- | ----------------------------- |
| Cookie | neptun-session | Yes      | Session authentication cookie |

### Query Parameters

No query parameters required.

### Request Body

No request body required.

## Response Format

### Response Status Codes

| Status Code | Description                                     |
| ----------- | ----------------------------------------------- |
| 200         | Successfully retrieved configuration files      |
| 401         | Unauthorized (invalid or missing session)       |
| 404         | Repository not found or requires authentication |
| 429         | GitHub API rate limit exceeded                  |
| 500         | Server error                                    |

### Success Response (200 OK)

Returns an object containing the repository name and an array of configuration files.

```json
{
  "repository": "my-repository",
  "config_files": [
    {
      "path": "package.json",
      "content": "{\n  \"name\": \"my-project\",\n  \"version\": \"1.0.0\",\n  ...}",
      "category": "javascript"
    },
    {
      "path": "docker-compose.yml",
      "content": "version: '3'\nservices:\n  ...",
      "category": "docker"
    }
  ]
}
```

### Error Response (401 Unauthorized)

```json
{
  "statusCode": 401,
  "statusMessage": "You must be logged in to access this endpoint"
}
```

### Error Response (404 Not Found)

```json
{
  "statusCode": 404,
  "statusMessage": "Repository not found or requires authentication."
}
```

### TypeScript Interface

```typescript
interface ConfigFile {
  path: string
  content: string
  category?: string
}

interface ConfigurationFilesResponse {
  repository: string
  config_files: ConfigFile[]
}
```

## Code Examples

### cURL Example

```bash
curl -X GET "https://neptun-webui.vercel.app/api/github/accounts/octocat/repositories/hello-world/configuration-files" \
  -H "Cookie: neptun-session=your-session-cookie"
```

### TypeScript/JavaScript Example

```typescript
async function getConfigurationFiles(accountName: string, repoName: string): Promise<ConfigurationFilesResponse> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/github/accounts/${accountName}/repositories/${repoName}/configuration-files`,
    {
      credentials: 'include', // Important for cookie handling
    }
  )

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return await response.json()
}
```

## Notes

- The endpoint first attempts to access the repository without authentication
- If public access fails and a GitHub token is available, it retries with token authentication
- Configuration files are detected based on predefined patterns for various categories
- The endpoint recursively searches through directories to find configuration files
- Empty repositories or repositories without configuration files will return an empty `config_files` array
- Rate limits are lower for unauthenticated requests compared to token-authenticated requests
