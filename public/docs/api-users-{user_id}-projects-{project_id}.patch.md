# Update Project Endpoint

## Overview

This endpoint allows users to update the details of an existing project.

## Request Details

### HTTP Method

PATCH

### Route

`/api/users/{user_id}/projects/{project_id}`

### Route Parameters

| Parameter  | Type    | Required | Description                      |
| ---------- | ------- | -------- | -------------------------------- |
| user_id    | integer | Yes      | The ID of the authenticated user |
| project_id | integer | Yes      | The ID of the project to update  |

### Headers

| Header       | Value            | Required | Description                   |
| ------------ | ---------------- | -------- | ----------------------------- |
| Accept       | application/json | Yes      | Specifies the response format |
| Content-Type | application/json | Yes      | Specifies the request format  |
| Cookie       | neptun-session   | Yes      | Session authentication cookie |

### Query Parameters

No query parameters required.

### Request Body

| Field                | Type   | Required | Description                            |
| -------------------- | ------ | -------- | -------------------------------------- |
| name                 | string | No       | The updated name of the project        |
| description          | string | No       | The updated description of the project |
| project_type         | string | No       | The updated type of the project        |
| programming_language | string | No       | The updated main programming language  |

```json
{
  "name": "Updated Project Name",
  "description": "Updated project description",
  "project_type": "web-site",
  "programming_language": "typescript"
}
```

## Response Format

### Response Status Codes

| Status Code | Description                               |
| ----------- | ----------------------------------------- |
| 200         | Successfully updated project              |
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
    "name": "Updated Project Name",
    "description": "Updated project description",
    "project_type": "web-site",
    "programming_language": "typescript",
    "created_at": "2025-02-16T17:42:11.000Z",
    "updated_at": "2025-02-16T18:42:11.000Z",
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

interface UpdateProjectRequest {
  name?: string
  description?: string
  project_type?: string
  programming_language?: string
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

class UpdateProjectRequest(BaseModel):
    name: Optional[str]
    description: Optional[str]
    project_type: Optional[str]
    programming_language: Optional[str]

class ApiResponse(BaseModel):
    project: Project
```

## Code Examples

### cURL Example

```bash
curl -X PATCH "https://neptun-webui.vercel.app/api/users/1/projects/123" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Cookie: neptun-session=your-session-cookie" \
  -d '{
    "name": "Updated Project Name",
    "description": "Updated project description",
    "project_type": "web-site",
    "programming_language": "typescript"
  }'
```

### Python Example

```python
import httpx
from typing import Optional

async def update_project(
    user_id: int,
    project_id: int,
    name: Optional[str] = None,
    description: Optional[str] = None,
    project_type: Optional[str] = None,
    programming_language: Optional[str] = None,
    session_cookie: str
) -> ApiResponse:
    url = f"https://neptun-webui.vercel.app/api/users/{user_id}/projects/{project_id}"
    data = {}
    if name is not None:
        data["name"] = name
    if description is not None:
        data["description"] = description
    if project_type is not None:
        data["project_type"] = project_type
    if programming_language is not None:
        data["programming_language"] = programming_language

    async with httpx.AsyncClient() as client:
        response = await client.patch(
            url,
            json=data,
            headers={
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Cookie": f"neptun-session={session_cookie}"
            }
        )
        response.raise_for_status()
        return ApiResponse(**response.json())
```

### TypeScript/JavaScript Example

```typescript
async function updateProject(
  userId: number,
  projectId: number,
  data: UpdateProjectRequest,
  sessionCookie: string
): Promise<ApiResponse> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}/projects/${projectId}`,
    {
      method: 'PATCH',
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
- The project must belong to the specified user
- Only the provided fields will be updated
- If provided, project_type must be a valid enum value
- If provided, programming_language must be a valid language identifier
- The updated_at timestamp will be automatically updated
- All IDs must be valid positive integers
