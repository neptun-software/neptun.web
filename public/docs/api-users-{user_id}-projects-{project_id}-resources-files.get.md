# Project Files List Endpoint

## Overview

This endpoint allows users to retrieve a list of file resources associated with a project.

## Request Details

### HTTP Method

GET

### Route

`/api/users/{user_id}/projects/{project_id}/resources/files`

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

| Parameter             | Type   | Required | Description                                          |
| --------------------- | ------ | -------- | ---------------------------------------------------- |
| context_file_category | string | No       | Filter files by category (e.g., 'source', 'config')  |
| context_file_type     | string | No       | Filter files by type (e.g., 'component', 'settings') |

## Response Format

### Response Status Codes

| Status Code | Description                               |
| ----------- | ----------------------------------------- |
| 200         | Successfully retrieved files              |
| 401         | Unauthorized (invalid or missing session) |
| 403         | Forbidden (user_id mismatch)              |
| 404         | Project not found                         |
| 500         | Server error                              |

### Success Response (200 OK)

```json
{
  "files": [
    {
      "id": 123,
      "title": "My Source File",
      "original_path": "/src/components/App.tsx",
      "context_file_category": "source",
      "context_file_type": "component",
      "text": "import React from 'react';\n\nexport const App = () => {\n  return <div>Hello World</div>;\n};\n",
      "language": "typescript",
      "extension": "tsx",
      "created_at": "2025-02-16T17:42:11.000Z",
      "updated_at": "2025-02-16T17:42:11.000Z",
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
interface ProjectFile {
  id: number
  title: string
  original_path: string
  context_file_category: string
  context_file_type: string
  text: string
  language: string
  extension: string
  created_at: string
  updated_at: string
  neptun_user_id: number
  project_id: number
}

interface ApiResponse {
  files: ProjectFile[]
}
```

### Python Model

```python
from datetime import datetime
from typing import List
from pydantic import BaseModel

class ProjectFile(BaseModel):
    id: int
    title: str
    original_path: str
    context_file_category: str
    context_file_type: str
    text: str
    language: str
    extension: str
    created_at: datetime
    updated_at: datetime
    neptun_user_id: int
    project_id: int

class ApiResponse(BaseModel):
    files: List[ProjectFile]
```

## Code Examples

### cURL Example

```bash
curl -X GET "https://neptun-webui.vercel.app/api/users/1/projects/1/resources/files?context_file_category=source" \
  -H "Accept: application/json" \
  -H "Cookie: neptun-session=your-session-cookie"
```

### Python Example

```python
import httpx
from typing import Optional

async def get_project_files(
    user_id: int,
    project_id: int,
    context_file_category: Optional[str] = None,
    context_file_type: Optional[str] = None,
    session_cookie: str
) -> ApiResponse:
    url = f"https://neptun-webui.vercel.app/api/users/{user_id}/projects/{project_id}/resources/files"
    params = {}

    if context_file_category:
        params["context_file_category"] = context_file_category
    if context_file_type:
        params["context_file_type"] = context_file_type

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
async function getProjectFiles(
  userId: number,
  projectId: number,
  params: {
    context_file_category?: string
    context_file_type?: string
  },
  sessionCookie: string
): Promise<ApiResponse> {
  const queryParams = new URLSearchParams()
  if (params.context_file_category) {
    queryParams.append('context_file_category', params.context_file_category)
  }
  if (params.context_file_type) {
    queryParams.append('context_file_type', params.context_file_type)
  }

  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}/projects/${projectId}/resources/files?${queryParams}`,
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
- Results can be filtered by context_file_category and context_file_type
- If no files exist, returns an empty array
- Results are sorted by creation date in descending order
- The text field contains the full content of the file
