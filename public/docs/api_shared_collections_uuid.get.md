# Shared Collection Details Endpoint

## Overview

This endpoint retrieves a specific shared template collection by its UUID, including all associated templates.

## Request Details

### HTTP Method

GET

### Route

`/api/shared/collections/{uuid}`

### Route Parameters

| Parameter | Type   | Required | Description                                     |
|-----------|--------|----------|-------------------------------------------------|
| uuid      | string | Yes      | The unique identifier of the template collection |

### Headers

| Header          | Value            | Required | Description                    |
|-----------------|------------------|----------|--------------------------------|
| Accept          | application/json | Yes      | Specifies the response format |

## Response Format

### Success Response (200 OK)

| Field       | Type   | Description                                     |
|-------------|--------|-------------------------------------------------|
| collection  | object | The template collection object                  |
| templates   | array  | Array of templates belonging to the collection  |

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

interface ApiResponse {
  collection: TemplateCollection;
  templates: Template[];
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

class ApiResponse(BaseModel):
    collection: TemplateCollection
    templates: List[Template]
```

## Code Examples

### cURL

```bash
curl -X GET "https://neptun-webui.vercel.app/api/shared/collections/550e8400-e29b-41d4-a716-446655440000" \
  -H "Accept: application/json"
```

### Python Example (using httpx)

```python
import httpx

async def get_shared_collection(uuid: str) -> dict:
    url = f"https://neptun-webui.vercel.app/api/shared/collections/{uuid}"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.json()
```

### TypeScript Example (using fetch)

```typescript
async function getSharedCollection(uuid: string): Promise<ApiResponse> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/shared/collections/${uuid}`,
    {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
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
}
```

### Error Response

```json
{
  "statusCode": 404,
  "message": "Template collection not found"
}
```

### Response Status Codes

| Status Code | Description                                |
|-------------|--------------------------------------------|
| 200         | Successfully retrieved collection          |
| 404         | Template collection with UUID does not exist |
| 403         | Collection is not shared                   |
