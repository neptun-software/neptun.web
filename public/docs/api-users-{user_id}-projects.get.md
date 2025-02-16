# List Projects Endpoint

## Overview

This endpoint allows users to retrieve a list of their projects with optional filtering by project type and programming language.

## Request Details

### HTTP Method

GET

### Route

`/api/users/{user_id}/projects`

### Route Parameters

| Parameter | Type    | Required | Description                      |
| --------- | ------- | -------- | -------------------------------- |
| user_id   | integer | Yes      | The ID of the authenticated user |

### Headers

| Header | Value            | Required | Description                   |
| ------ | ---------------- | -------- | ----------------------------- |
| Accept | application/json | Yes      | Specifies the response format |
| Cookie | neptun-session   | Yes      | Session authentication cookie |

### Query Parameters

| Parameter            | Type   | Required | Description                                |
| -------------------- | ------ | -------- | ------------------------------------------ |
| project_type         | string | No       | Filter projects by type (e.g., 'web-site') |
| programming_language | string | No       | Filter projects by programming language    |

## Response Format

### Response Status Codes

| Status Code | Description                               |
| ----------- | ----------------------------------------- |
| 200         | Successfully retrieved projects           |
| 400         | Bad request (invalid parameters)          |
| 401         | Unauthorized (invalid or missing session) |
| 403         | Forbidden (user_id mismatch)              |
| 500         | Server error                              |

### Success Response (200 OK)

```json
{
  "projects": [
    {
      "id": 123,
      "name": "My Project",
      "description": "A description of my project",
      "project_type": "web-site",
      "programming_language": "typescript",
      "created_at": "2025-02-16T17:42:11.000Z",
      "updated_at": "2025-02-16T17:42:11.000Z",
      "neptun_user_id": 456
    },
    {
      "id": 124,
      "name": "Another Project",
      "description": "Another project description",
      "project_type": "mobile-app",
      "programming_language": "kotlin",
      "created_at": "2025-02-16T17:45:11.000Z",
      "updated_at": "2025-02-16T17:45:11.000Z",
      "neptun_user_id": 456
    }
  ]
}
```

### Error Response (400 Bad Request)

```json
{
  "statusCode": 400,
  "message": "Invalid query parameters"
}
```

### TypeScript Interface

```typescript
interface Project {
  id: number
  name: string
  description?: string
  project_type: string
  programming_language: string
  created_at: string
  updated_at: string
  neptun_user_id: number
}

interface ApiResponse {
  projects: Project[]
}
```

### Python Model

```python
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

class Project(BaseModel):
    id: int
    name: str
    description: Optional[str]
    project_type: str
    programming_language: str
    created_at: datetime
    updated_at: datetime
    neptun_user_id: int

class ApiResponse(BaseModel):
    projects: List[Project]
```

## Code Examples

### cURL Example

```bash
curl "https://neptun-webui.vercel.app/api/users/1/projects?project_type=web-site" \
  -H "Accept: application/json" \
  -H "Cookie: neptun-session=your-session-cookie"
```

### Python Example

```python
import httpx
from typing import Optional

async def list_projects(
    user_id: int,
    project_type: Optional[str] = None,
    programming_language: Optional[str] = None,
    session_cookie: str
) -> ApiResponse:
    url = f"https://neptun-webui.vercel.app/api/users/{user_id}/projects"
    params = {}
    if project_type:
        params["project_type"] = project_type
    if programming_language:
        params["programming_language"] = programming_language

    async with httpx.AsyncClient() as client:
        response = await client.get(
            url,
            params=params,
            headers={
                "Accept": "application/json",
                "Cookie": f"neptun-session={session_cookie}"
            }
        )
        response.raise_for_status()
        return ApiResponse(**response.json())
```

### TypeScript/JavaScript Example

```typescript
async function listProjects(
  userId: number,
  params: {
    project_type?: string
    programming_language?: string
  },
  sessionCookie: string
): Promise<ApiResponse> {
  const queryParams = new URLSearchParams()
  if (params.project_type) {
    queryParams.append('project_type', params.project_type)
  }
  if (params.programming_language) {
    queryParams.append('programming_language', params.programming_language)
  }

  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}/projects?${queryParams}`,
    {
      headers: {
        Accept: 'application/json',
        Cookie: `neptun-session=${sessionCookie}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return await response.json()
}
```

## Notes

- The session cookie is required for authentication
- Results are sorted by creation date in descending order
- If no filters are provided, all projects for the user will be returned
- Both project_type and programming_language filters are optional
- The response is paginated with a default limit of 20 projects per page
