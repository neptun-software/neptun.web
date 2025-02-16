# Update Project Import Endpoint

## Overview

This endpoint allows users to update an existing import resource within a project.

## Request Details

### HTTP Method

PUT

### Route

`/api/users/{user_id}/projects/{project_id}/resources/imports/{import_id}`

### Route Parameters

| Parameter  | Type    | Required | Description                      |
| ---------- | ------- | -------- | -------------------------------- |
| user_id    | integer | Yes      | The ID of the authenticated user |
| project_id | integer | Yes      | The ID of the project            |
| import_id  | integer | Yes      | The ID of the import to update   |

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
| source_type | string | No       | Type of the import source (e.g., 'github') |
| source_path | string | No       | Path or identifier for the import source   |
| title       | string | No       | Title of the import                        |
| description | string | No       | Description of the import                  |

```json
{
  "title": "Updated GitHub Import",
  "description": "Updated import from GitHub repository"
}
```

## Response Format

### Response Status Codes

| Status Code | Description                               |
| ----------- | ----------------------------------------- |
| 200         | Successfully updated import               |
| 400         | Bad request (invalid parameters)          |
| 401         | Unauthorized (invalid or missing session) |
| 403         | Forbidden (user_id mismatch)              |
| 404         | Import not found                          |
| 500         | Server error                              |

### Success Response (200 OK)

```json
{
  "import": {
    "id": 123,
    "source_type": "github",
    "source_path": "username/repository",
    "title": "Updated GitHub Import",
    "description": "Updated import from GitHub repository",
    "created_at": "2025-02-16T17:42:11.000Z",
    "updated_at": "2025-02-16T18:42:11.000Z",
    "neptun_user_id": 456,
    "project_id": 789
  }
}
```

### Error Response (404 Not Found)

```json
{
  "statusCode": 404,
  "message": "Import not found"
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

interface UpdateProjectImportRequest {
  source_type?: string
  source_path?: string
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

class UpdateProjectImportRequest(BaseModel):
    source_type: Optional[str]
    source_path: Optional[str]
    title: Optional[str]
    description: Optional[str]

class ApiResponse(BaseModel):
    import_: ProjectImport = Field(alias='import')
```

## Code Examples

### cURL Example

```bash
curl -X PUT "https://neptun-webui.vercel.app/api/users/1/projects/789/resources/imports/123" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Cookie: neptun-session=your-session-cookie" \
  -d '{
    "title": "Updated GitHub Import",
    "description": "Updated import from GitHub repository"
  }'
```

### Python Example

```python
import httpx
from typing import Optional

async def update_project_import(
    user_id: int,
    project_id: int,
    import_id: int,
    source_type: Optional[str] = None,
    source_path: Optional[str] = None,
    title: Optional[str] = None,
    description: Optional[str] = None,
    session_cookie: str
) -> ApiResponse:
    url = f"https://neptun-webui.vercel.app/api/users/{user_id}/projects/{project_id}/resources/imports/{import_id}"
    data = {}
    if source_type is not None:
        data["source_type"] = source_type
    if source_path is not None:
        data["source_path"] = source_path
    if title is not None:
        data["title"] = title
    if description is not None:
        data["description"] = description

    async with httpx.AsyncClient() as client:
        response = await client.put(
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
async function updateProjectImport(
  userId: number,
  projectId: number,
  importId: number,
  data: UpdateProjectImportRequest,
  sessionCookie: string
): Promise<ApiResponse> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}/projects/${projectId}/resources/imports/${importId}`,
    {
      method: 'PUT',
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
- The project and import must belong to the specified user
- Only the provided fields will be updated
- If provided, source_type must be a valid enum value
- If provided, source_path format must match the source_type
- The updated_at timestamp will be automatically updated
- All IDs must be valid positive integers
- For GitHub imports, appropriate GitHub installation permissions are required
