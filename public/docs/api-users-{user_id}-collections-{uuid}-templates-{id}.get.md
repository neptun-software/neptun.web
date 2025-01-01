# User Template Details Endpoint

## Overview

This endpoint allows users to retrieve details of a specific template within a collection.

## Request Details

### HTTP Method

GET

### Route

`/api/users/{user_id}/collections/{uuid}/templates/{id}`

### Route Parameters

| Parameter | Type    | Required | Description                                      |
| --------- | ------- | -------- | ------------------------------------------------ |
| user_id   | integer | Yes      | The ID of the authenticated user                 |
| uuid      | string  | Yes      | The unique identifier of the template collection |
| id        | integer | Yes      | The ID of the template                           |

### Headers

| Header | Value            | Required | Description                   |
| ------ | ---------------- | -------- | ----------------------------- |
| Accept | application/json | Yes      | Specifies the response format |
| Cookie | neptun-session   | Yes      | Session authentication cookie |

### Query Parameters

No query parameters required.

### Request Body

No request body required.

## Response Format

### Response Status Codes

| Status Code | Description                               |
| ----------- | ----------------------------------------- |
| 200         | Successfully retrieved template           |
| 401         | Unauthorized (invalid or missing session) |
| 403         | Forbidden (user_id mismatch)              |
| 404         | Template not found                        |
| 500         | Server error                              |

### Success Response (200 OK)

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

### Error Response (404 Not Found)

```json
{
  "statusCode": 404,
  "message": "Template not found"
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
  title?: string
  text: string
  language: string
  extension: string
}

interface ApiResponse {
  template: Template
}
```

### Python Model

```python
from datetime import datetime
from typing import Optional
from pydantic import BaseModel

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

class ApiResponse(BaseModel):
    template: Template
```

## Code Examples

### cURL Example

```bash
curl -X GET "https://neptun-webui.vercel.app/api/users/1/collections/550e8400-e29b-41d4-a716-446655440000/templates/1" \
  -H "Accept: application/json" \
  -H "Cookie: neptun-session=your-session-cookie"
```

### Python Example

```python
import httpx
from typing import Optional

async def get_template(
    user_id: int,
    collection_uuid: str,
    template_id: int,
    session_cookie: str
) -> ApiResponse:
    url = f"https://neptun-webui.vercel.app/api/users/{user_id}/collections/{collection_uuid}/templates/{template_id}"

    async with httpx.AsyncClient() as client:
        response = await client.get(
            url,
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
async function getTemplate(
  userId: number,
  collectionUuid: string,
  templateId: number,
  sessionCookie: string
): Promise<ApiResponse> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}/collections/${collectionUuid}/templates/${templateId}`,
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
- The template must belong to the specified collection
- The collection must belong to the specified user
