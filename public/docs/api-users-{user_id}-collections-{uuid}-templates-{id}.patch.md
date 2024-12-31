# User Template Update Endpoint

## Overview

This endpoint allows users to update a specific template's details within a collection.

## Request Details

### HTTP Method

PATCH

### Route

`/api/users/{user_id}/collections/{uuid}/templates/{id}`

### Route Parameters

| Parameter | Type    | Required | Description                                      |
| --------- | ------- | -------- | ------------------------------------------------ |
| user_id   | integer | Yes      | The ID of the authenticated user                 |
| uuid      | string  | Yes      | The unique identifier of the template collection |
| id        | integer | Yes      | The ID of the template                           |

### Headers

| Header       | Value            | Required | Description                   |
| ------------ | ---------------- | -------- | ----------------------------- |
| Accept       | application/json | Yes      | Specifies the response format |
| Content-Type | application/json | Yes      | Request body format           |
| Cookie       | neptun-session   | Yes      | Session authentication cookie |

### Request Body

| Field       | Type   | Required | Description                     |
| ----------- | ------ | -------- | ------------------------------- |
| description | string | No       | New description of the template |
| file_name   | string | No       | New name of the template file   |

## Response Format

### Success Response (200 OK)

| Field    | Type   | Description                 |
| -------- | ------ | --------------------------- |
| template | object | The updated template object |

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

interface UpdateTemplateRequest {
  description?: string
  file_name?: string
}

interface ApiResponse {
  template: Template
}
```

### Python Types

```python
from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class UpdateTemplateRequest(BaseModel):
    description: Optional[str]
    file_name: Optional[str]

class Template(BaseModel):
    id: int
    description: Optional[str]
    file_name: str
    created_at: datetime
    updated_at: datetime
    neptun_user_id: int
    template_collection_id: Optional[int]
    user_file_id: Optional[int]

class ApiResponse(BaseModel):
    template: Template
```

## Code Examples

### cURL

```bash
curl -X PATCH "https://neptun-webui.vercel.app/api/users/1/collections/550e8400-e29b-41d4-a716-446655440000/templates/1" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Cookie: neptun-session=your-session-cookie" \
  -d '{
    "description": "Updated Docker deployment script",
    "file_name": "docker-deploy-v2.sh"
  }'
```

### Python Example (using httpx)

```python
import httpx
from typing import Optional

async def update_template(
    user_id: int,
    collection_uuid: str,
    template_id: int,
    description: Optional[str] = None,
    file_name: Optional[str] = None,
    session_cookie: str = None
) -> dict:
    url = f"https://neptun-webui.vercel.app/api/users/{user_id}/collections/{collection_uuid}/templates/{template_id}"

    data = {}
    if description is not None:
        data["description"] = description
    if file_name is not None:
        data["file_name"] = file_name

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
async function updateTemplate(
  userId: number,
  collectionUuid: string,
  templateId: number,
  data: UpdateTemplateRequest,
  sessionCookie: string
): Promise<ApiResponse> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}/collections/${collectionUuid}/templates/${templateId}`,
    {
      method: 'PATCH',
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
  "template": {
    "id": 1,
    "description": "Updated Docker deployment script",
    "file_name": "docker-deploy-v2.sh",
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-01-01T12:30:00Z",
    "neptun_user_id": 1,
    "template_collection_id": 1,
    "user_file_id": 1
  }
}
```

### Error Response

```json
{
  "statusCode": 400,
  "message": "Invalid template data"
}
```

### Response Status Codes

| Status Code | Description                               |
| ----------- | ----------------------------------------- |
| 200         | Successfully updated template             |
| 400         | Bad Request (invalid request body)        |
| 401         | Unauthorized (invalid or missing session) |
| 403         | Forbidden (user_id mismatch)              |
| 404         | Template not found                        |
| 500         | Server error                              |
