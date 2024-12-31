# Shared Collections Endpoint

## Overview

This endpoint retrieves all publicly shared template collections, including their associated templates.

## Request Details

### HTTP Method

GET

### Route

`/api/shared/collections`

### Headers

| Header | Value            | Required | Description                   |
| ------ | ---------------- | -------- | ----------------------------- |
| Accept | application/json | Yes      | Specifies the response format |

## Response Format

### Success Response (200 OK)

| Field       | Type   | Description                                 |
| ----------- | ------ | ------------------------------------------- |
| collections | array  | Array of shared template collection objects |
| total       | number | Total number of shared collections          |

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

interface ApiResponse {
  collections: TemplateCollection[]
  total: number
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
    collections: List[TemplateCollection]
    total: int
```

## Code Examples

### cURL

```bash
curl -X GET "https://neptun-webui.vercel.app/api/shared/collections" \
  -H "Accept: application/json"
```

### Python Example (using httpx)

```python
import httpx

async def get_shared_collections() -> dict:
    url = "https://neptun-webui.vercel.app/api/shared/collections"

    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.json()
```

### TypeScript Example (using fetch)

```typescript
async function getSharedCollections(): Promise<ApiResponse> {
  const response = await fetch(
    'https://neptun-webui.vercel.app/api/shared/collections',
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
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

### Error Response

```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

### Response Status Codes

| Status Code | Description                        |
| ----------- | ---------------------------------- |
| 200         | Successfully retrieved collections |
| 500         | Server error                       |
