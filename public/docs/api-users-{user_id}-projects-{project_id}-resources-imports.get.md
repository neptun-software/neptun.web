# List Project Imports Endpoint

## Overview

This endpoint allows users to retrieve a list of import resources associated with a project.

## Request Details

### HTTP Method

GET

### Route

`/api/users/{user_id}/projects/{project_id}/resources/imports`

### Route Parameters

| Parameter  | Type    | Required | Description                      |
| ---------- | ------- | -------- | -------------------------------- |
| user_id    | integer | Yes      | The ID of the authenticated user |
| project_id | integer | Yes      | The ID of the project            |

### Headers

| Header | Value            | Required | Description                   |
| ------ | ---------------- | -------- | ----------------------------- |
| Accept | application/json | Yes      | Specifies the response format |
| Cookie | neptun-session   | Yes      | Session authentication cookie |

### Query Parameters

| Parameter   | Type   | Required | Description                   |
| ----------- | ------ | -------- | ----------------------------- |
| source_type | string | No       | Filter imports by source type |

## Response Format

### Response Status Codes

| Status Code | Description                               |
| ----------- | ----------------------------------------- |
| 200         | Successfully retrieved imports            |
| 400         | Bad request (invalid parameters)          |
| 401         | Unauthorized (invalid or missing session) |
| 403         | Forbidden (user_id mismatch)              |
| 404         | Project not found                         |
| 500         | Server error                              |

### Success Response (200 OK)

```json
{
  "imports": [
    {
      "id": 123,
      "source_type": "github",
      "source_path": "username/repository",
      "title": "My GitHub Import",
      "description": "Importing from GitHub repository",
      "created_at": "2025-02-16T17:42:11.000Z",
      "updated_at": "2025-02-16T17:42:11.000Z",
      "neptun_user_id": 456,
      "project_id": 789
    },
    {
      "id": 124,
      "source_type": "github",
      "source_path": "username/another-repository",
      "title": "Another GitHub Import",
      "description": "Another import from GitHub",
      "created_at": "2025-02-16T18:42:11.000Z",
      "updated_at": "2025-02-16T18:42:11.000Z",
      "neptun_user_id": 456,
      "project_id": 789
    }
  ]
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
interface ProjectImport {
  id: number
  source_type: string
  source_path: string
  title?: string
  description?: string
  created_at: string
  updated_at: string
  neptun_user_id: number
  project_id: number
}

interface ApiResponse {
  imports: ProjectImport[]
}
```

### Python Model

```python
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

class ProjectImport(BaseModel):
    id: int
    source_type: str
    source_path: str
    title: Optional[str]
    description: Optional[str]
    created_at: datetime
    updated_at: datetime
    neptun_user_id: int
    project_id: int

class ApiResponse(BaseModel):
    imports: List[ProjectImport]
```

## Code Examples

### cURL Example

```bash
curl -X GET "https://neptun-webui.vercel.app/api/users/1/projects/789/resources/imports?source_type=github" \
  -H "Accept: application/json" \
  -H "Cookie: neptun-session=your-session-cookie"
```

### Python Example

```python
import httpx
from typing import Optional

async def list_project_imports(
    user_id: int,
    project_id: int,
    source_type: Optional[str] = None,
    session_cookie: str
) -> ApiResponse:
    url = f"https://neptun-webui.vercel.app/api/users/{user_id}/projects/{project_id}/resources/imports"
    params = {}
    if source_type:
        params["source_type"] = source_type

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
async function listProjectImports(
  userId: number,
  projectId: number,
  sourceType?: string,
  sessionCookie: string
): Promise<ApiResponse> {
  const params = new URLSearchParams()
  if (sourceType) {
    params.append('source_type', sourceType)
  }

  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}/projects/${projectId}/resources/imports?${params}`,
    {
      method: 'GET',
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
- Returns an empty array if no imports are found
- The source_type query parameter is optional and can be used to filter imports
- All IDs must be valid positive integers
- For GitHub imports, appropriate GitHub installation permissions are required to view the imports
