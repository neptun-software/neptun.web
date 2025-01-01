# Shared Collections Endpoint

## Overview

This endpoint retrieves all publicly shared template collections, including their associated templates.

## Request Details

### HTTP Method

GET

### Route

`/api/shared/collections`

### Route Parameters

No route parameters required.

### Headers

| Header | Value            | Required | Description                   |
| ------ | ---------------- | -------- | ----------------------------- |
| Accept | application/json | Yes      | Specifies the response format |

### Query Parameters

No query parameters required.

### Request Body

No request body required.

## Response Format

### Response Status Codes

| Status Code | Description                        |
| ----------- | ---------------------------------- |
| 200         | Successfully retrieved collections |
| 500         | Server error                       |

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

### Error Responses

#### Internal Server Error (500)

```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

### TypeScript Interface

```typescript
interface Template {
  id: number
  description: string | null
  file_name: string
  created_at: string
  updated_at: string
  title: string
  text: string
  language: string
  extension: string
}

interface TemplateCollection {
  id: number
  name: string
  description: string | null
  is_shared: boolean
  share_uuid: string
  created_at: string
  updated_at: string
  templates: Template[]
}

interface GetSharedCollectionsResponse {
  collections: TemplateCollection[]
  total: number
}

interface GetSharedCollectionsError {
  statusCode: number
  statusMessage: string
  message: string
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
    title: str
    text: str
    language: str = "text"
    extension: str = "txt"

class TemplateCollection(BaseModel):
    id: int
    name: str
    description: Optional[str]
    is_shared: bool
    share_uuid: str
    created_at: datetime
    updated_at: datetime
    templates: List[Template]

class GetSharedCollectionsResponse(BaseModel):
    collections: List[TemplateCollection]
    total: int

class GetSharedCollectionsError(BaseModel):
    statusCode: int
    statusMessage: str
    message: str
```

## Code Examples

### cURL Example

```bash
curl -X GET "https://neptun-webui.vercel.app/api/shared/collections" \
  -H "Accept: application/json"
```

### Python Example

```python
import httpx
from typing import List
from datetime import datetime

async def get_shared_collections() -> GetSharedCollectionsResponse:
    url = "https://neptun-webui.vercel.app/api/shared/collections"

    async with httpx.AsyncClient() as client:
        response = await client.get(
            url,
            headers={"Accept": "application/json"}
        )
        response.raise_for_status()
        return GetSharedCollectionsResponse(**response.json())
```

### TypeScript/JavaScript Example

```typescript
async function getSharedCollections(): Promise<GetSharedCollectionsResponse> {
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

## Notes

- The endpoint returns all publicly shared template collections
- Each collection includes its complete set of templates
- Collections that are not marked as shared are not included
- The total field indicates the total number of shared collections
- All timestamps are returned in ISO 8601 format
- Optional fields may be null or undefined
