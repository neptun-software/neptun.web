# Get Installation Imports Endpoint

## Overview

This endpoint retrieves all GitHub repositories that have been imported through a specific GitHub App installation.

## Request Details

### HTTP Method

GET

### Route

`/api/users/{user_id}/installations/{installation_id}/imports`

### Route Parameters

| Parameter       | Type   | Required | Description                                      |
| --------------- | ------ | -------- | ------------------------------------------------ |
| user_id         | string | Yes      | Unique identifier of the user                    |
| installation_id | number | Yes      | Unique identifier of the GitHub App installation |

### Headers

| Header | Value          | Required | Description                   |
| ------ | -------------- | -------- | ----------------------------- |
| Cookie | neptun-session | Yes      | Session authentication cookie |

### Query Parameters

No query parameters required.

### Request Body

No request body required.

## Response Format

### Success Response (200 OK)

```json
[
  {
    "id": 1,
    "github_app_installation_id": 12345,
    "repository_name": "my-project",
    "repository_owner": "octocat",
    "repository_url": "https://github.com/octocat/my-project",
    "created_at": "2024-03-20T10:00:00Z",
    "updated_at": "2024-03-20T10:00:00Z"
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

#### TypeScript Interfaces

```typescript
interface GithubRepository {
  id: number
  github_app_installation_id: number
  repository_name: string
  repository_owner: string
  repository_url: string
  created_at: string
  updated_at: string
}

interface GetImportsError {
  statusCode: number
  statusMessage: string
  data: {
    message: string
  }
}
```

#### Python Models

```python
from pydantic import BaseModel, HttpUrl
from datetime import datetime

class GithubRepository(BaseModel):
    id: int
    github_app_installation_id: int
    repository_name: str
    repository_owner: str
    repository_url: HttpUrl
    created_at: datetime
    updated_at: datetime

class GetImportsError(BaseModel):
    statusCode: int
    statusMessage: str
    data: dict[str, str]
```

## Code Examples

### Python Example (using httpx)

```python
from typing import List

async def get_installation_imports(
    user_id: str,
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

### TypeScript/JavaScript Example (using fetch)

```typescript
async function getInstallationImports(
  userId: string,
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

### Response Status Codes

| Status Code | Description                                  |
| ----------- | -------------------------------------------- |
| 200         | Successfully retrieved imported repositories |
| 401         | Unauthorized (invalid or missing session)    |
| 404         | Installation or user not found               |
| 500         | Server error                                 |

## Notes

- The session cookie is required for authentication
- Returns an empty array if no repositories have been imported
- Each repository entry includes basic GitHub repository information
- The repository_url points to the GitHub repository page
- Installation must belong to the authenticated user
