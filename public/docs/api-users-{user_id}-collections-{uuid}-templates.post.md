# User Template Creation Endpoint

## Overview

This endpoint allows users to create a new template within a specific collection.

## Request Details

### HTTP Method

POST

### Route

`/api/users/{user_id}/collections/{uuid}/templates`

### Route Parameters

| Parameter | Type    | Required | Description                                      |
| --------- | ------- | -------- | ------------------------------------------------ |
| user_id   | integer | Yes      | The ID of the authenticated user                 |
| uuid      | string  | Yes      | The unique identifier of the template collection |

### Headers

| Header       | Value            | Required | Description                   |
| ------------ | ---------------- | -------- | ----------------------------- |
| Accept       | application/json | Yes      | Specifies the response format |
| Content-Type | application/json | Yes      | Request body format           |
| Cookie       | neptun-session   | Yes      | Session authentication cookie |

### Request Body

| Field                | Type   | Required | Description                        |
| -------------------- | ------ | -------- | ---------------------------------- |
| template.description | string | No       | Description of the template        |
| template.file_name   | string | Yes      | Name of the template file          |
| file.content         | string | Yes      | Content of the template file       |
| file.name            | string | Yes      | Original name of the uploaded file |
| file.type            | string | Yes      | MIME type of the file              |

## Response Format

### Success Response (201 Created)

| Field    | Type   | Description                 |
| -------- | ------ | --------------------------- |
| template | object | The created template object |

### TypeScript Types

```typescript
interface Template {
  id: number
  description?: string
  file_name: string
  created_at: Date
  updated_at: Date
  neptun_user_id: number
  template_collection_id?: number
  user_file_id?: number
}

interface UserFile {
  content: string
  name: string
  type: string
}

interface CreateTemplateRequest {
  template: {
    description?: string
    file_name: string
  }
  file: UserFile
}

interface ApiResponse {
  template: Template
}
```

### Python Types

```python
from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class UserFile(BaseModel):
    content: str
    name: str
    type: str

class TemplateData(BaseModel):
    description: Optional[str]
    file_name: str

class CreateTemplateRequest(BaseModel):
    template: TemplateData
    file: UserFile

class Template(BaseModel):
    id: int
    description: Optional[str]
    file_name: str
    created_at: datetime
    updated_at: datetime
    neptun_user_id: int
    template_collection_id: Optional[int]
    user_file_id: Optional[int]

class ApiResponse(BaseModel):
    template: Template
```

## Code Examples

### cURL

```bash
curl -X POST "https://neptun-webui.vercel.app/api/users/1/collections/550e8400-e29b-41d4-a716-446655440000/templates" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Cookie: neptun-session=your-session-cookie" \
  -d '{
    "template": {
      "description": "Basic Docker deployment script",
      "file_name": "docker-deploy.sh"
    },
    "file": {
      "content": "#!/bin/bash\necho \"Hello Docker\"",
      "name": "docker-deploy.sh",
      "type": "text/x-shellscript"
    }
  }'
```

### Python Example (using httpx)

```python
import httpx
from typing import Optional

async def create_template(
    user_id: int,
    collection_uuid: str,
    file_name: str,
    file_content: str,
    file_type: str,
    description: Optional[str] = None,
    session_cookie: str = None
) -> dict:
    url = f"https://neptun-webui.vercel.app/api/users/{user_id}/collections/{collection_uuid}/templates"

    data = {
        "template": {
            "file_name": file_name,
            "description": description
        },
        "file": {
            "content": file_content,
            "name": file_name,
            "type": file_type
        }
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            url,
            json=data,
            headers={
                "Cookie": f"neptun-session={session_cookie}",
                "Content-Type": "application/json"
            }
        )
        response.raise_for_status()
        return response.json()
```

### TypeScript Example (using fetch)

```typescript
async function createTemplate(
  userId: number,
  collectionUuid: string,
  data: CreateTemplateRequest,
  sessionCookie: string
): Promise<ApiResponse> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}/collections/${collectionUuid}/templates`,
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

## Example Responses

### Success Response

```json
{
  "template": {
    "id": 1,
    "description": "Basic Docker deployment script",
    "file_name": "docker-deploy.sh",
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z",
    "neptun_user_id": 1,
    "template_collection_id": 1,
    "user_file_id": 1
  }
}
```

### Error Response

```json
{
  "statusCode": 400,
  "message": "Invalid body format. Expected { template, file }"
}
```

### Response Status Codes

| Status Code | Description                               |
| ----------- | ----------------------------------------- |
| 201         | Successfully created template             |
| 400         | Bad Request (invalid request body)        |
| 401         | Unauthorized (invalid or missing session) |
| 403         | Forbidden (user_id mismatch)              |
| 404         | Collection not found                      |
| 500         | Server error                              |
