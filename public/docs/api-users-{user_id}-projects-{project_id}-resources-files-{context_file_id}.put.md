# Update Project File Endpoint

## Overview

This endpoint allows users to update an existing file resource within a project.

## Request Details

### HTTP Method

PUT

### Route

`/api/users/{user_id}/projects/{project_id}/resources/files/{context_file_id}`

### Route Parameters

| Parameter       | Type    | Required | Description                      |
| --------------- | ------- | -------- | -------------------------------- |
| user_id         | integer | Yes      | The ID of the authenticated user |
| project_id      | integer | Yes      | The ID of the project            |
| context_file_id | integer | Yes      | The ID of the file to update     |

### Headers

| Header       | Value            | Required | Description                   |
| ------------ | ---------------- | -------- | ----------------------------- |
| Accept       | application/json | Yes      | Specifies the response format |
| Content-Type | application/json | Yes      | Specifies the request format  |
| Cookie       | neptun-session   | Yes      | Session authentication cookie |

### Query Parameters

No query parameters required.

### Request Body

| Field                 | Type   | Required | Description                              |
| --------------------- | ------ | -------- | ---------------------------------------- |
| title                 | string | No       | Updated title of the file                |
| original_path         | string | No       | Updated original path of the file        |
| context_file_category | string | No       | Updated category of the context file     |
| context_file_type     | string | No       | Updated type of the context file         |
| text                  | string | No       | Updated content of the file              |
| language              | string | No       | Updated programming language of the file |
| extension             | string | No       | Updated file extension                   |

```json
{
  "title": "Updated Source File",
  "text": "import React from 'react';\n\nexport const App = () => {\n  return <div>Updated Content</div>;\n};\n",
  "context_file_category": "source",
  "context_file_type": "component"
}
```

## Response Format

### Response Status Codes

| Status Code | Description                               |
| ----------- | ----------------------------------------- |
| 200         | Successfully updated file                 |
| 400         | Bad request (invalid parameters)          |
| 401         | Unauthorized (invalid or missing session) |
| 403         | Forbidden (user_id mismatch)              |
| 404         | File not found                            |
| 500         | Server error                              |

### Success Response (200 OK)

```json
{
  "file": {
    "id": 123,
    "title": "Updated Source File",
    "original_path": "/src/components/App.tsx",
    "context_file_category": "source",
    "context_file_type": "component",
    "text": "import React from 'react';\n\nexport const App = () => {\n  return <div>Updated Content</div>;\n};\n",
    "language": "typescript",
    "extension": "tsx",
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
  "message": "File not found"
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
  language?: string
  extension?: string
  created_at: string
  updated_at: string
  neptun_user_id: number
  project_id: number
}

interface UpdateProjectFileRequest {
  title?: string
  original_path?: string
  context_file_category?: string
  context_file_type?: string
  text?: string
  language?: string
  extension?: string
}

interface ApiResponse {
  file: ProjectFile
}
```

### Python Model

```python
from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class ProjectFile(BaseModel):
    id: int
    title: str
    original_path: str
    context_file_category: str
    context_file_type: str
    text: str
    language: Optional[str]
    extension: Optional[str]
    created_at: datetime
    updated_at: datetime
    neptun_user_id: int
    project_id: int

class UpdateProjectFileRequest(BaseModel):
    title: Optional[str]
    original_path: Optional[str]
    context_file_category: Optional[str]
    context_file_type: Optional[str]
    text: Optional[str]
    language: Optional[str]
    extension: Optional[str]

class ApiResponse(BaseModel):
    file: ProjectFile
```

## Code Examples

### cURL Example

```bash
curl -X PUT "https://neptun-webui.vercel.app/api/users/1/projects/789/resources/files/123" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Cookie: neptun-session=your-session-cookie" \
  -d '{
    "title": "Updated Source File",
    "text": "import React from '\''react'\'';\n\nexport const App = () => {\n  return <div>Updated Content</div>;\n};\n",
    "context_file_category": "source",
    "context_file_type": "component"
  }'
```

### Python Example

```python
import httpx
from typing import Optional

async def update_project_file(
    user_id: int,
    project_id: int,
    context_file_id: int,
    title: Optional[str] = None,
    original_path: Optional[str] = None,
    context_file_category: Optional[str] = None,
    context_file_type: Optional[str] = None,
    text: Optional[str] = None,
    language: Optional[str] = None,
    extension: Optional[str] = None,
    session_cookie: str
) -> ApiResponse:
    url = f"https://neptun-webui.vercel.app/api/users/{user_id}/projects/{project_id}/resources/files/{context_file_id}"
    data = {}
    if title is not None:
        data["title"] = title
    if original_path is not None:
        data["original_path"] = original_path
    if context_file_category is not None:
        data["context_file_category"] = context_file_category
    if context_file_type is not None:
        data["context_file_type"] = context_file_type
    if text is not None:
        data["text"] = text
    if language is not None:
        data["language"] = language
    if extension is not None:
        data["extension"] = extension

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
async function updateProjectFile(
  userId: number,
  projectId: number,
  contextFileId: number,
  data: UpdateProjectFileRequest,
  sessionCookie: string
): Promise<ApiResponse> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}/projects/${projectId}/resources/files/${contextFileId}`,
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
- The project and file must belong to the specified user
- Only the provided fields will be updated
- If provided, context_file_category and context_file_type must be valid enum values
- If provided, language and extension will be validated against supported values
- The updated_at timestamp will be automatically updated
- All IDs must be valid positive integers
- The text content must be properly escaped when sending via API
