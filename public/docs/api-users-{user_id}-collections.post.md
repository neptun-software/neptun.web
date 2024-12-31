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

### Request Body

| Field       | Type    | Required | Description                      |
| ----------- | ------- | -------- | -------------------------------- |
| name        | string  | Yes      | Name of the collection           |
| description | string  | No       | Description of the collection    |
| is_shared   | boolean | Yes      | Whether the collection is shared |

## Response Format

### Success Response (201 Created)

| Field      | Type   | Description                            |
| ---------- | ------ | -------------------------------------- |
| collection | object | The created template collection object |

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

interface TemplateCollection {
  id: number
  name: string
  description?: string
  is_shared: boolean
  share_uuid: string
  created_at: Date
  updated_at: Date
  neptun_user_id: number
  templates: Template[]
}

interface CreateCollectionRequest {
  name: string
  description?: string
  is_shared: boolean
}

interface ApiResponse {
  collection: TemplateCollection
}
```

### Python Types

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

class ApiResponse(BaseModel):
    collection: TemplateCollection
```

## Code Examples

### cURL

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

### Python Example (using httpx)

```python
import httpx
from typing import Optional

async def create_user_collection(
    user_id: int,
    name: str,
    is_shared: bool,
    description: Optional[str],
    session_cookie: str
) -> dict:
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
            headers={"Cookie": f"neptun-session={session_cookie}"}
        )
        response.raise_for_status()
        return response.json()
```

### TypeScript Example (using fetch)

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

## Example Responses

### Success Response

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

### Error Response

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### Response Status Codes

| Status Code | Description                               |
| ----------- | ----------------------------------------- |
| 201         | Successfully created collection           |
| 400         | Bad Request (invalid request body)        |
| 401         | Unauthorized (invalid or missing session) |
| 403         | Forbidden (user_id mismatch)              |
| 500         | Server error                              |
