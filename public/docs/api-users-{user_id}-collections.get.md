# User Template Collections List Endpoint

## Overview

This endpoint allows users to retrieve all their template collections.

## Request Details

### HTTP Method

GET

### Route

`/api/users/{user_id}/collections`

### Route Parameters

| Parameter | Type    | Required | Description                      |
| --------- | ------- | -------- | -------------------------------- |
| user_id   | integer | Yes      | The ID of the authenticated user |

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
| 200         | Successfully retrieved collections        |
| 401         | Unauthorized (invalid or missing session) |
| 403         | Forbidden (user_id mismatch)              |
| 500         | Server error                              |

### Success Response (200 OK)

```json
{
  "collections": [
    {
      "id": 1,
      "name": "Deployment Scripts",
      "description": "Common deployment scripts for various platforms",
      "is_shared": true,
      "share_uuid": "550e8400-e29b-41d4-a716-446655440000",
      "created_at": "2024-01-01T12:00:00Z",
      "updated_at": "2024-01-01T12:00:00Z",
      "neptun_user_id": 1,
      "templates": [
        {
          "id": 1,
          "description": "Basic Docker deployment script",
          "file_name": "docker-deploy.sh",
          "created_at": "2024-01-01T12:00:00Z",
          "updated_at": "2024-01-01T12:00:00Z",
          "neptun_user_id": 1,
          "template_collection_id": 1,
          "user_file_id": 1
        }
      ]
    }
  ],
  "total": 1
}
```

### Error Response (401 Unauthorized)

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
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

interface TemplateCollection {
  id: number
  name: string
  description?: string
  is_shared: boolean
  share_uuid: string
  created_at: string
  updated_at: string
  neptun_user_id: number
  templates: Template[]
}

interface ApiResponse {
  collections: TemplateCollection[]
  total: number
}
```

### Python Model

```python
from datetime import datetime
from typing import Optional, List
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

class TemplateCollection(BaseModel):
    id: int
    name: str
    description: Optional[str]
    is_shared: bool
    share_uuid: str
    created_at: datetime
    updated_at: datetime
    neptun_user_id: int
    templates: List[Template]

class ApiResponse(BaseModel):
    collections: List[TemplateCollection]
    total: int
```

## Code Examples

### cURL Example

```bash
curl -X GET "https://neptun-webui.vercel.app/api/users/1/collections" \
  -H "Accept: application/json" \
  -H "Cookie: neptun-session=your-session-cookie"
```

### Python Example

```python
import httpx

async def get_user_collections(
    user_id: int,
    session_cookie: str
) -> ApiResponse:
    url = f"https://neptun-webui.vercel.app/api/users/{user_id}/collections"

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
async function getUserCollections(
  userId: number,
  sessionCookie: string
): Promise<ApiResponse> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}/collections`,
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
- Returns all collections owned by the specified user
- The total field indicates the total number of collections
- Each collection includes its associated templates
