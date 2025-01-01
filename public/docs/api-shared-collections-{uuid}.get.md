# Shared Collection Details Endpoint

## Overview

This endpoint retrieves a specific shared template collection by its UUID, including all associated templates.

## Request Details

### HTTP Method

GET

### Route

`/api/shared/collections/{uuid}`

### Route Parameters

| Parameter | Type   | Required | Description                                      |
| --------- | ------ | -------- | ------------------------------------------------ |
| uuid      | string | Yes      | The unique identifier of the template collection |

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

| Status Code | Description                                  |
| ----------- | -------------------------------------------- |
| 200         | Successfully retrieved collection            |
| 404         | Template collection with UUID does not exist |
| 403         | Collection is not shared                     |

### Success Response (200 OK)

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

### Error Responses

#### Not Found (404)

```json
{
  "statusCode": 404,
  "message": "Template collection not found"
}
```

#### Forbidden (403)

```json
{
  "statusCode": 403,
  "message": "Collection is not shared"
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

interface GetSharedCollectionResponse {
  collection: TemplateCollection
}

interface GetSharedCollectionError {
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

class GetSharedCollectionResponse(BaseModel):
    collection: TemplateCollection

class GetSharedCollectionError(BaseModel):
    statusCode: int
    statusMessage: str
    message: str
```

## Code Examples

### cURL Example

```bash
curl -X GET "https://neptun-webui.vercel.app/api/shared/collections/550e8400-e29b-41d4-a716-446655440000" \
  -H "Accept: application/json"
```

### Python Example

```python
import httpx

async def get_shared_collection(uuid: str) -> ApiResponse:
    url = f"https://neptun-webui.vercel.app/api/shared/collections/{uuid}"

    async with httpx.AsyncClient() as client:
        response = await client.get(
            url,
            headers={"Accept": "application/json"}
        )
        response.raise_for_status()
        return ApiResponse(**response.json())
```

### TypeScript/JavaScript Example

```typescript
async function getSharedCollection(uuid: string): Promise<ApiResponse> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/shared/collections/${uuid}`,
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

- The endpoint requires a valid UUID to identify the template collection
- Collections must be explicitly shared to be accessible via this endpoint
- All templates associated with the collection are included in the response
- Timestamps are returned in ISO 8601 format
- Optional fields may be null or undefined
