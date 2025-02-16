# Create Project Import Endpoint

## Overview

This endpoint allows users to create a new import resource within a project.

## Request Details

### HTTP Method

POST

### Route

`/api/users/{user_id}/projects/{project_id}/resources/imports`

### Route Parameters

| Parameter  | Type    | Required | Description                      |
| ---------- | ------- | -------- | -------------------------------- |
| user_id    | integer | Yes      | The ID of the authenticated user |
| project_id | integer | Yes      | The ID of the project            |

### Headers

| Header       | Value            | Required | Description                   |
| ------------ | ---------------- | -------- | ----------------------------- |
| Accept       | application/json | Yes      | Specifies the response format |
| Content-Type | application/json | Yes      | Specifies the request format  |
| Cookie       | neptun-session   | Yes      | Session authentication cookie |

### Query Parameters

No query parameters required.

### Request Body

| Field       | Type   | Required | Description                                |
| ----------- | ------ | -------- | ------------------------------------------ |
| source_type | string | Yes      | Type of the import source (e.g., 'github') |
| source_path | string | Yes      | Path or identifier for the import source   |
| title       | string | No       | Title of the import                        |
| description | string | No       | Description of the import                  |

```json
{
  "source_type": "github",
  "source_path": "username/repository",
  "title": "My GitHub Import",
  "description": "Importing from GitHub repository"
}
```

## Response Format

### Response Status Codes

| Status Code | Description                               |
| ----------- | ----------------------------------------- |
| 201         | Successfully created import               |
| 400         | Bad request (invalid parameters)          |
| 401         | Unauthorized (invalid or missing session) |
| 403         | Forbidden (user_id mismatch)              |
| 404         | Project not found                         |
| 500         | Server error                              |

### Success Response (201 Created)

```json
{
  "import": {
    "id": 123,
    "source_type": "github",
    "source_path": "username/repository",
    "title": "My GitHub Import",
    "description": "Importing from GitHub repository",
    "created_at": "2025-02-16T17:42:11.000Z",
    "updated_at": "2025-02-16T17:42:11.000Z",
    "neptun_user_id": 456,
    "project_id": 789
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

interface CreateProjectImportRequest {
  source_type: string
  source_path: string
  title?: string
  description?: string
}

interface ApiResponse {
  import: ProjectImport
}
```

### Python Model

```python
from datetime import datetime
from typing import Optional
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

class CreateProjectImportRequest(BaseModel):
    source_type: str
    source_path: str
    title: Optional[str]
    description: Optional[str]

class ApiResponse(BaseModel):
    import_: ProjectImport = Field(alias='import')
```

## Code Examples

### cURL Example

```bash
curl -X POST "https://neptun-webui.vercel.app/api/users/1/projects/789/resources/imports" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Cookie: neptun-session=your-session-cookie" \
  -d '{
    "source_type": "github",
    "source_path": "username/repository",
    "title": "My GitHub Import",
    "description": "Importing from GitHub repository"
  }'
```

### Python Example

```python
import httpx
from typing import Optional

async def create_project_import(
    user_id: int,
    project_id: int,
    source_type: str,
    source_path: str,
    title: Optional[str] = None,
    description: Optional[str] = None,
    session_cookie: str
) -> ApiResponse:
    url = f"https://neptun-webui.vercel.app/api/users/{user_id}/projects/{project_id}/resources/imports"
    data = {
        "source_type": source_type,
        "source_path": source_path
    }
    if title:
        data["title"] = title
    if description:
        data["description"] = description

    async with httpx.AsyncClient() as client:
        response = await client.post(
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
async function createProjectImport(
  userId: number,
  projectId: number,
  data: CreateProjectImportRequest,
  sessionCookie: string
): Promise<ApiResponse> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}/projects/${projectId}/resources/imports`,
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
- The project must belong to the specified user
- The source_type must be a valid enum value
- The source_path format depends on the source_type
- The import will be automatically associated with the specified project
- All IDs must be valid positive integers
- For GitHub imports, appropriate GitHub installation permissions are required
