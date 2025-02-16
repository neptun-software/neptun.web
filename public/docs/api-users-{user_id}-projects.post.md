# Create Project Endpoint

## Overview

This endpoint allows users to create a new project with specified details.

## Request Details

### HTTP Method

POST

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

No query parameters required.

### Request Body

| Field                | Type   | Required | Description                                      |
| -------------------- | ------ | -------- | ------------------------------------------------ |
| name                 | string | Yes      | The name of the project                          |
| description          | string | No       | A description of the project                     |
| project_type         | string | Yes      | Type of project (e.g., 'web-site', 'mobile-app') |
| programming_language | string | Yes      | The main programming language of the project     |

```json
{
  "name": "My Project",
  "description": "A description of my project",
  "project_type": "web-site",
  "programming_language": "typescript"
}
```

## Response Format

### Response Status Codes

| Status Code | Description                               |
| ----------- | ----------------------------------------- |
| 201         | Successfully created project              |
| 400         | Bad request (invalid parameters)          |
| 401         | Unauthorized (invalid or missing session) |
| 403         | Forbidden (user_id mismatch)              |
| 500         | Server error                              |

### Success Response (201 Created)

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

### Error Response (400 Bad Request)

```json
{
  "statusCode": 400,
  "message": "Invalid request parameters"
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
curl -X POST "https://neptun-webui.vercel.app/api/users/1/projects" \
  -H "Accept: application/json" \
  -H "Cookie: neptun-session=your-session-cookie" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Project",
    "description": "A description of my project",
    "project_type": "web-site",
    "programming_language": "typescript"
  }'
```

### Python Example

```python
import httpx

async def create_project(
    user_id: int,
    name: str,
    project_type: str,
    programming_language: str,
    description: Optional[str] = None,
    session_cookie: str
) -> ApiResponse:
    url = f"https://neptun-webui.vercel.app/api/users/{user_id}/projects"
    data = {
        "name": name,
        "project_type": project_type,
        "programming_language": programming_language
    }
    if description:
        data["description"] = description

    async with httpx.AsyncClient() as client:
        response = await client.post(
            url,
            json=data,
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
async function createProject(
  userId: number,
  data: {
    name: string
    description?: string
    project_type: string
    programming_language: string
  },
  sessionCookie: string
): Promise<ApiResponse> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}/projects`,
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Cookie': `neptun-session=${sessionCookie}`,
      },
      body: JSON.stringify(data),
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
- The project_type must be one of the predefined types
- The programming_language must be a valid language identifier
- The description field is optional
- The created project will be automatically associated with the specified user
