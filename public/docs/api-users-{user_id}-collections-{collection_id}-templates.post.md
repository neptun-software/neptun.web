# User Template Creation Endpoint

## Overview

This endpoint allows users to create a new template within a specific collection.

## Request Details

### HTTP Method

POST

### Route

`/api/users/{user_id}/collections/{collection_id}/templates`

### Route Parameters

| Parameter     | Type    | Required | Description                       |
| ------------- | ------- | -------- | --------------------------------- |
| user_id       | integer | Yes      | The ID of the authenticated user  |
| collection_id | integer | Yes      | The ID of the template collection |

### Headers

| Header       | Value            | Required | Description                   |
| ------------ | ---------------- | -------- | ----------------------------- |
| Accept       | application/json | Yes      | Specifies the response format |
| Content-Type | application/json | Yes      | Request body format           |
| Cookie       | neptun-session   | Yes      | Session authentication cookie |

### Query Parameters

No query parameters required.

### Request Body

| Field                | Type   | Required | Description                  |
| -------------------- | ------ | -------- | ---------------------------- |
| template.description | string | No       | Description of the template  |
| template.file_name   | string | Yes      | Name of the template file    |
| file                 | string | Yes      | Content of the template file |

## Response Format

### Response Status Codes

| Status Code | Description                               |
| ----------- | ----------------------------------------- |
| 201         | Successfully created template             |
| 400         | Bad Request (invalid request body)        |
| 401         | Unauthorized (invalid or missing session) |
| 403         | Forbidden (user_id mismatch)              |
| 404         | Collection not found                      |
| 500         | Server error                              |

### Success Response (201 Created)

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

### Error Response (400 Bad Request)

```json
{
  "statusCode": 400,
  "message": "Invalid body format. Expected { template, file }"
}
```

### TypeScript Interface

```typescript
interface Template {
  id: number
  description?: string
  file_name: string
  created_at: string
  updated_at: string
  neptun_user_id: number
  template_collection_id?: number
  user_file_id?: number
}

interface UserFile {
  title?: string
  text: string
  language: string
  extension: string
  neptun_user_id: number
}

interface CreateTemplateRequest {
  template: {
    description?: string
    file_name: string
    neptun_user_id: number
  }
  file: UserFile
}

interface ApiResponse {
  template: Template & UserFile
}
```

### Python Model

```python
from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class UserFile(BaseModel):
    title: Optional[str]
    text: str
    language: str
    extension: str
    neptun_user_id: int

class TemplateData(BaseModel):
    description: Optional[str]
    file_name: str
    neptun_user_id: int

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
    title: Optional[str]
    text: str
    language: str
    extension: str
```

## Code Examples

### cURL Example

```bash
curl -X POST "https://neptun-webui.vercel.app/api/users/1/collections/1/templates" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Cookie: neptun-session=your-session-cookie" \
  -d '{
    "template": {
      "description": "Basic Docker deployment script",
      "file_name": "docker-deploy.sh"
    },
    "file": "#!/bin/bash\ndocker build -t myapp .\ndocker run -d myapp"
  }'
```

### Python Example

```python
import httpx
from typing import Optional

async def create_template(
    user_id: int,
    collection_id: int,
    file_name: str,
    file_content: str,
    description: Optional[str] = None,
    session_cookie: str = None
) -> ApiResponse:
    url = f"https://neptun-webui.vercel.app/api/users/{user_id}/collections/{collection_id}/templates"

    data = {
        "template": {
            "file_name": file_name,
            "description": description
        },
        "file": file_content
    }

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
async function createTemplate(
  userId: number,
  collectionId: number,
  data: CreateTemplateRequest,
  sessionCookie: string
): Promise<ApiResponse> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}/collections/${collectionId}/templates`,
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
- The collection must belong to the specified user
- The file_name must be unique within the collection
- The file content must be a valid text file
