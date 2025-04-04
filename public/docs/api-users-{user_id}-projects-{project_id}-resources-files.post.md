# Create Project File Endpoint

## Overview

This endpoint allows users to create a new file resource within a project.

## Request Details

### HTTP Method

POST

### Route

`/api/users/{user_id}/projects/{project_id}/resources/files`

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

| Field                 | Type   | Required | Description                      |
| --------------------- | ------ | -------- | -------------------------------- |
| title                 | string | Yes      | Title of the file                |
| original_path         | string | Yes      | Original path of the file        |
| context_file_category | string | Yes      | Category of the context file     |
| context_file_type     | string | Yes      | Type of the context file         |
| text                  | string | Yes      | Content of the file              |
| language              | string | No       | Programming language of the file |
| extension             | string | No       | File extension                   |

```json
{
  "title": "My Source File",
  "original_path": "/src/components/App.tsx",
  "context_file_category": "source",
  "context_file_type": "component",
  "text": "import React from 'react';\n\nexport const App = () => {\n  return <div>Hello World</div>;\n};\n",
  "language": "typescript",
  "extension": "tsx"
}
```

## Response Format

### Response Status Codes

| Status Code | Description                               |
| ----------- | ----------------------------------------- |
| 201         | Successfully created file                 |
| 400         | Bad request (invalid parameters)          |
| 401         | Unauthorized (invalid or missing session) |
| 403         | Forbidden (user_id mismatch)              |
| 404         | Project not found                         |
| 500         | Server error                              |

### Success Response (201 Created)

```json
{
  "file": {
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

interface CreateProjectFileRequest {
  title: string
  original_path: string
  context_file_category: string
  context_file_type: string
  text: string
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

class CreateProjectFileRequest(BaseModel):
    title: str
    original_path: str
    context_file_category: str
    context_file_type: str
    text: str
    language: Optional[str]
    extension: Optional[str]

class ApiResponse(BaseModel):
    file: ProjectFile
```

## Code Examples

### cURL Example

```bash
curl -X POST "https://neptun-webui.vercel.app/api/users/1/projects/789/resources/files" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Cookie: neptun-session=your-session-cookie" \
  -d '{
    "title": "My Source File",
    "original_path": "/src/components/App.tsx",
    "context_file_category": "source",
    "context_file_type": "component",
    "text": "import React from '\''react'\'';\n\nexport const App = () => {\n  return <div>Hello World</div>;\n};\n",
    "language": "typescript",
    "extension": "tsx"
  }'
```

### Python Example

```python
import httpx
from typing import Optional

async def create_project_file(
    user_id: int,
    project_id: int,
    title: str,
    original_path: str,
    context_file_category: str,
    context_file_type: str,
    text: str,
    language: Optional[str] = None,
    extension: Optional[str] = None,
    session_cookie: str
) -> ApiResponse:
    url = f"https://neptun-webui.vercel.app/api/users/{user_id}/projects/{project_id}/resources/files"
    data = {
        "title": title,
        "original_path": original_path,
        "context_file_category": context_file_category,
        "context_file_type": context_file_type,
        "text": text
    }
    if language:
        data["language"] = language
    if extension:
        data["extension"] = extension

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
async function createProjectFile(
  userId: number,
  projectId: number,
  data: CreateProjectFileRequest,
  sessionCookie: string
): Promise<ApiResponse> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}/projects/${projectId}/resources/files`,
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
- Both context_file_category and context_file_type must be valid enum values
- If not provided, language and extension will be inferred from the file content or path
- The file will be automatically associated with the specified project
- All IDs must be valid positive integers
- The text content must be properly escaped when sending via API
