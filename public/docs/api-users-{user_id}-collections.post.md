# User Template Collection Creation Endpoint

## Overview

This endpoint allows users to create a new template collection.

## Request Details

### HTTP Method

POST

### Route

`/api/users/{user_id}/collections`

### Route Parameters

| Parameter | Type    | Required | Description                      |
| --------- | ------- | -------- | -------------------------------- |
| user_id   | integer | Yes      | The ID of the authenticated user |

### Headers

| Header       | Value            | Required | Description                   |
| ------------ | ---------------- | -------- | ----------------------------- |
| Accept       | application/json | Yes      | Specifies the response format |
| Content-Type | application/json | Yes      | Request body format           |
| Cookie       | neptun-session   | Yes      | Session authentication cookie |

### Query Parameters

No query parameters required.

### Request Body

| Field       | Type    | Required | Description                      |
| ----------- | ------- | -------- | -------------------------------- |
| name        | string  | Yes      | Name of the collection           |
| description | string  | No       | Description of the collection    |
| is_shared   | boolean | Yes      | Whether the collection is shared |

## Response Format

### Response Status Codes

| Status Code | Description                               |
| ----------- | ----------------------------------------- |
| 201         | Successfully created collection           |
| 400         | Bad Request (invalid request body)        |
| 401         | Unauthorized (invalid or missing session) |
| 403         | Forbidden (user_id mismatch)              |
| 500         | Server error                              |

### Success Response (201 Created)

```json
{
  "collection": {
    "id": 2,
    "name": "My Templates",
    "description": "Collection of my deployment templates",
    "is_shared": false,
    "share_uuid": "660f8500-e29b-41d4-a716-446655440000",
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z",
    "neptun_user_id": 1,
    "templates": []
  }
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

interface CreateCollectionRequest {
  name: string
  description?: string
  is_shared: boolean
  neptun_user_id: number
}

interface ApiResponse {
  collection: TemplateCollection
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

class CreateCollectionRequest(BaseModel):
    name: str
    description: Optional[str]
    is_shared: bool
    neptun_user_id: int

class ApiResponse(BaseModel):
    collection: TemplateCollection
```

## Code Examples

### cURL Example

```bash
curl -X POST "https://neptun-webui.vercel.app/api/users/1/collections" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Cookie: neptun-session=your-session-cookie" \
  -d '{
    "name": "My Templates",
    "description": "Collection of my deployment templates",
    "is_shared": false
  }'
```

### Python Example

```python
import httpx
from typing import Optional

async def create_user_collection(
    user_id: int,
    name: str,
    is_shared: bool,
    description: Optional[str],
    session_cookie: str
) -> ApiResponse:
    url = f"https://neptun-webui.vercel.app/api/users/{user_id}/collections"

    data = {
        "name": name,
        "is_shared": is_shared,
        "description": description
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
async function createUserCollection(
  userId: number,
  data: CreateCollectionRequest,
  sessionCookie: string
): Promise<ApiResponse> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}/collections`,
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
- The name field must be unique for the user
- When is_shared is true, a share_uuid will be generated
- The templates array will initially be empty
