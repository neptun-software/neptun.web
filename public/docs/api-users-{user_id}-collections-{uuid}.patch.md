# User Template Collection Update Endpoint

## Overview

This endpoint allows users to update a specific template collection's details.

## Request Details

### HTTP Method

PATCH

### Route

`/api/users/{user_id}/collections/{uuid}`

### Route Parameters

| Parameter | Type    | Required | Description                                     |
|-----------|---------|----------|-------------------------------------------------|
| user_id   | integer | Yes      | The ID of the authenticated user               |
| uuid      | string  | Yes      | The unique identifier of the template collection |

### Headers

| Header          | Value            | Required | Description                    |
|-----------------|------------------|----------|--------------------------------|
| Accept          | application/json | Yes      | Specifies the response format |
| Content-Type    | application/json | Yes      | Request body format           |
| Cookie          | neptun-session   | Yes      | Session authentication cookie |

### Request Body

| Field       | Type    | Required | Description                          |
|-------------|---------|----------|--------------------------------------|
| name        | string  | No       | New name of the collection          |
| description | string  | No       | New description of the collection   |
| is_shared   | boolean | No       | Whether the collection is shared    |

## Response Format

### Success Response (200 OK)

| Field       | Type   | Description                                     |
|-------------|--------|------------------------------------------------|
| collection  | object | The updated template collection object          |

### TypeScript Types

```typescript
interface Template {
  id: number;
  description?: string;
  file_name: string;
  created_at: Date;
  updated_at: Date;
  neptun_user_id: number;
  template_collection_id?: number;
  user_file_id?: number;
}

interface TemplateCollection {
  id: number;
  name: string;
  description?: string;
  is_shared: boolean;
  share_uuid: string;
  created_at: Date;
  updated_at: Date;
  neptun_user_id: number;
  templates: Template[];
}

interface UpdateCollectionRequest {
  name?: string;
  description?: string;
  is_shared?: boolean;
}

interface ApiResponse {
  collection: TemplateCollection;
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

class UpdateCollectionRequest(BaseModel):
    name: Optional[str]
    description: Optional[str]
    is_shared: Optional[bool]

class ApiResponse(BaseModel):
    collection: TemplateCollection
```

## Code Examples

### cURL

```bash
curl -X PATCH "https://neptun-webui.vercel.app/api/users/1/collections/550e8400-e29b-41d4-a716-446655440000" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Cookie: neptun-session=your-session-cookie" \
  -d '{
    "name": "Updated Templates",
    "description": "Updated collection description",
    "is_shared": true
  }'
```

### Python Example (using httpx)

```python
import httpx
from typing import Optional

async def update_user_collection(
    user_id: int,
    collection_uuid: str,
    name: Optional[str] = None,
    description: Optional[str] = None,
    is_shared: Optional[bool] = None,
    session_cookie: str = None
) -> dict:
    url = f"https://neptun-webui.vercel.app/api/users/{user_id}/collections/{collection_uuid}"
    
    data = {}
    if name is not None:
        data["name"] = name
    if description is not None:
        data["description"] = description
    if is_shared is not None:
        data["is_shared"] = is_shared
    
    async with httpx.AsyncClient() as client:
        response = await client.patch(
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
async function updateUserCollection(
  userId: number,
  collectionUuid: string,
  data: UpdateCollectionRequest,
  sessionCookie: string
): Promise<ApiResponse> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}/collections/${collectionUuid}`,
    {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Cookie': `neptun-session=${sessionCookie}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}
```

## Example Responses

### Success Response

```json
{
  "collection": {
    "id": 1,
    "name": "Updated Templates",
    "description": "Updated collection description",
    "is_shared": true,
    "share_uuid": "550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-01-01T12:30:00Z",
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
}
```

### Error Response

```json
{
  "statusCode": 400,
  "message": "Invalid body({ name?, description?, is_shared? })"
}
```

### Response Status Codes

| Status Code | Description                                |
|-------------|--------------------------------------------|
| 200         | Successfully updated collection            |
| 400         | Bad Request (invalid request body)         |
| 401         | Unauthorized (invalid or missing session)   |
| 403         | Forbidden (user_id mismatch)               |
| 404         | Collection not found                       |
| 500         | Server error                               | 
