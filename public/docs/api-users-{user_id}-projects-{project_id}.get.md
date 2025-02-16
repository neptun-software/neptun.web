# Get Project Details Endpoint

## Overview

This endpoint allows users to retrieve detailed information about a specific project.

## Request Details

### HTTP Method

GET

### Route

`/api/users/{user_id}/projects/{project_id}`

### Route Parameters

| Parameter  | Type    | Required | Description                      |
| ---------- | ------- | -------- | -------------------------------- |
| user_id    | integer | Yes      | The ID of the authenticated user |
| project_id | integer | Yes      | The ID of the project to fetch   |

### Headers

| Header | Value            | Required | Description                   |
| ------ | ---------------- | -------- | ----------------------------- |
| Accept | application/json | Yes      | Specifies the response format |
| Cookie | neptun-session   | Yes      | Session authentication cookie |

### Query Parameters

No query parameters required.

## Response Format

### Response Status Codes

| Status Code | Description                               |
| ----------- | ----------------------------------------- |
| 200         | Successfully retrieved project            |
| 400         | Bad request (invalid parameters)          |
| 401         | Unauthorized (invalid or missing session) |
| 403         | Forbidden (user_id mismatch)              |
| 404         | Project not found                         |
| 500         | Server error                              |

### Success Response (200 OK)

```json
{
  "project": {
    "id": 123,
    "name": "My Project",
    "description": "A description of my project",
    "project_type": "web-site",
    "programming_language": "typescript",
    "created_at": "2025-02-16T17:42:11.000Z",
    "updated_at": "2025-02-16T17:42:11.000Z",
    "neptun_user_id": 456
  }
}
```

### Error Response (404 Not Found)

```json
{
  "statusCode": 404,
  "message": "Project not found"
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
  project: Project
}
```

### Python Model

```python
from datetime import datetime
from typing import Optional
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
    project: Project
```

## Code Examples

### cURL Example

```bash
curl "https://neptun-webui.vercel.app/api/users/1/projects/123" \
  -H "Accept: application/json" \
  -H "Cookie: neptun-session=your-session-cookie"
```

### Python Example

```python
import httpx

async def get_project(
    user_id: int,
    project_id: int,
    session_cookie: str
) -> ApiResponse:
    url = f"https://neptun-webui.vercel.app/api/users/{user_id}/projects/{project_id}"

    async with httpx.AsyncClient() as client:
        response = await client.get(
            url,
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
async function getProject(
  userId: number,
  projectId: number,
  sessionCookie: string
): Promise<ApiResponse> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}/projects/${projectId}`,
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
- The project must belong to the specified user
- Both user_id and project_id must be valid positive integers
- Returns detailed information about a specific project including all its metadata
