# GitHub App Configuration Files Endpoint

## Overview

This endpoint retrieves configuration files from a GitHub repository using GitHub App installation authentication.

## Request Details

### HTTP Method

GET

### Route

`/api/github/app/accounts/{github_account_id}/repositories/{github_repository_id}/configuration-files`

### Route Parameters

| Parameter            | Type    | Required | Description              |
| -------------------- | ------- | -------- | ------------------------ |
| github_account_id    | integer | Yes      | The GitHub account ID    |
| github_repository_id | integer | Yes      | The GitHub repository ID |

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
| 404         | Repository or GitHub App installation not found |
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
  "statusMessage": "GitHub App installation not found for this repository. Please install the GitHub App first."
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
curl -X GET "https://neptun-webui.vercel.app/api/github/app/accounts/12345/repositories/67890/configuration-files" \
  -H "Cookie: neptun-session=your-session-cookie"
```

### TypeScript/JavaScript Example

```typescript
async function getConfigurationFiles(accountId: number, repoId: number): Promise<ConfigurationFilesResponse> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/github/app/accounts/${accountId}/repositories/${repoId}/configuration-files`,
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

- The endpoint requires GitHub App installation for the specified repository
- Configuration files are detected based on predefined patterns for various categories
- The endpoint recursively searches through directories to find configuration files
- Empty repositories or repositories without configuration files will return an empty `config_files` array
- Rate limits are based on GitHub App installation quotas
