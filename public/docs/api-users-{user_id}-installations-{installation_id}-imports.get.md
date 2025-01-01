# Get Installation Imports Endpoint

## Overview

This endpoint retrieves all GitHub repositories that have been imported through a specific GitHub App installation.

## Request Details

### HTTP Method

GET

### Route

`/api/users/{user_id}/installations/{installation_id}/imports`

### Route Parameters

| Parameter       | Type    | Required | Description                                      |
| --------------- | ------- | -------- | ------------------------------------------------ |
| user_id         | integer | Yes      | Unique identifier of the user                    |
| installation_id | integer | Yes      | Unique identifier of the GitHub App installation |

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

| Status Code | Description                                  |
| ----------- | -------------------------------------------- |
| 200         | Successfully retrieved imported repositories |
| 401         | Unauthorized (invalid or missing session)    |
| 404         | Installation or user not found               |
| 500         | Server error                                 |

### Success Response (200 OK)

```json
[
  {
    "id": 1,
    "github_repository_id": 12345,
    "github_repository_name": "my-project",
    "github_repository_description": "A sample project",
    "github_repository_size": 1024,
    "github_repository_language": "TypeScript",
    "github_repository_license": "MIT",
    "github_repository_url": "https://github.com/octocat/my-project",
    "github_repository_website_url": "https://my-project.example.com",
    "github_repository_default_branch": "main",
    "github_repository_is_private": false,
    "github_repository_is_fork": false,
    "github_repository_is_template": false,
    "github_repository_is_archived": false,
    "created_at": "2024-03-20T10:00:00Z",
    "updated_at": "2024-03-20T10:00:00Z",
    "github_app_installation_id": 67890
  }
]
```

### Error Response (404 Not Found)

```json
{
  "statusCode": 404,
  "statusMessage": "Not Found",
  "data": {
    "message": "Installation not found"
  }
}
```

### TypeScript Interfaces

```typescript
interface GithubRepository {
  id: number
  github_repository_id: number
  github_repository_name: string
  github_repository_description?: string
  github_repository_size?: number
  github_repository_language?: string
  github_repository_license?: string
  github_repository_url: string
  github_repository_website_url?: string
  github_repository_default_branch?: string
  github_repository_is_private: boolean
  github_repository_is_fork?: boolean
  github_repository_is_template?: boolean
  github_repository_is_archived: boolean
  created_at: string
  updated_at: string
  github_app_installation_id: number
}

interface GetImportsError {
  statusCode: number
  statusMessage: string
  data: {
    message: string
  }
}
```

### Python Models

```python
from pydantic import BaseModel, HttpUrl
from datetime import datetime
from typing import Optional

class GithubRepository(BaseModel):
    id: int
    github_repository_id: int
    github_repository_name: str
    github_repository_description: Optional[str]
    github_repository_size: Optional[int]
    github_repository_language: Optional[str]
    github_repository_license: Optional[str]
    github_repository_url: str
    github_repository_website_url: Optional[str]
    github_repository_default_branch: Optional[str]
    github_repository_is_private: bool
    github_repository_is_fork: Optional[bool]
    github_repository_is_template: Optional[bool]
    github_repository_is_archived: bool
    created_at: datetime
    updated_at: datetime
    github_app_installation_id: int

class GetImportsError(BaseModel):
    statusCode: int
    statusMessage: str
    data: dict[str, str]
```

## Code Examples

### Python Example

```python
from typing import List

async def get_installation_imports(
    user_id: int,
    installation_id: int,
    session_cookie: str
) -> List[GithubRepository]:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://neptun-webui.vercel.app/api/users/{user_id}/installations/{installation_id}/imports",
            cookies={"neptun-session": session_cookie}
        )
        response.raise_for_status()
        return [GithubRepository(**repo) for repo in response.json()]
```

### cURL Example

```bash
curl -X GET \
  -H "Cookie: neptun-session=your-session-cookie" \
  "https://neptun-webui.vercel.app/api/users/your-user-id/installations/12345/imports"
```

### TypeScript/JavaScript Example

```typescript
async function getInstallationImports(
  userId: number,
  installationId: number
): Promise<GithubRepository[]> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}/installations/${installationId}/imports`,
    {
      credentials: 'include', // Important for cookie handling
    }
  )

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return await response.json() as GithubRepository[]
}
```

## Notes

- The session cookie is required for authentication
- Returns an empty array if no repositories have been imported
- Each repository entry includes basic GitHub repository information
- The repository_url points to the GitHub repository page
- Installation must belong to the authenticated user
