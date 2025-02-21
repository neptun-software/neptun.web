# User Project Chats List Endpoint

## Overview

This endpoint retrieves chat conversations for a specific user that are associated with a particular project.

## Request Details

### HTTP Method

GET

### Route

`/api/users/{user_id}/projects/{project_id}/chats`

### Route Parameters

| Parameter  | Type    | Required | Description                      |
| ---------- | ------- | -------- | -------------------------------- |
| user_id    | integer | Yes      | The ID of the authenticated user |
| project_id | integer | Yes      | The ID of the project            |

### Query Parameters

| Parameter | Type   | Required | Description                                                                                                        |
| --------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------ |
| order_by  | string | No       | Sort order for chats (format: "column:direction", e.g., "created_at:desc"). Multiple fields can be comma-separated |

### Headers

| Header | Value            | Required | Description                   |
| ------ | ---------------- | -------- | ----------------------------- |
| Accept | application/json | Yes      | Specifies the response format |
| Cookie | neptun-session   | Yes      | Session authentication cookie |

### Request Body

No request body required.

## Response Format

### Response Status Codes

| Status Code | Description                               |
| ----------- | ----------------------------------------- |
| 200         | Successfully retrieved chats              |
| 400         | Invalid parameters                        |
| 401         | Unauthorized (invalid or missing session) |
| 404         | User or project not found                 |
| 500         | Server error                              |

### Success Response (200 OK)

```json
{
  "chats": [
    {
      "id": 1,
      "neptun_user_id": 123,
      "model": "google/gemma-2-27b-it",
      "name": "Project Discussion",
      "created_at": "2024-03-20T10:00:00Z",
      "updated_at": "2024-03-20T10:00:00Z"
    }
  ]
}
```

### Error Response (401 Unauthorized)

```json
{
  "statusCode": 401,
  "statusMessage": "Unauthorized",
  "message": "You do not have access to view the information."
}
```

### Error Response (400 Bad Request)

```json
{
  "statusCode": 400,
  "statusMessage": "Bad Request",
  "data": {
    "issues": [
      {
        "code": "invalid_type",
        "message": "Invalid project_id"
      }
    ]
  }
}
```

### TypeScript Interface

```typescript
interface ChatConversation {
  id: number
  neptun_user_id: number
  model: string
  name: string
  created_at: string
  updated_at: string
}

interface ApiResponse {
  chats: ChatConversation[]
}
```

### Python Model

```python
from datetime import datetime
from typing import List
from pydantic import BaseModel

class ChatConversation(BaseModel):
    id: int
    neptun_user_id: int
    model: str
    name: str
    created_at: datetime
    updated_at: datetime

class ApiResponse(BaseModel):
    chats: List[ChatConversation]
```

## Code Examples

### cURL Example

```bash
curl -X GET "https://neptun-webui.vercel.app/api/users/1/projects/2/chats" \
  -H "Accept: application/json" \
  -H "Cookie: neptun-session=your-session-cookie"
```

### Python Example

```python
import httpx

async def get_project_chats(
    user_id: int,
    project_id: int,
    session_cookie: str,
    order_by: str = None
) -> ApiResponse:
    url = f"https://neptun-webui.vercel.app/api/users/{user_id}/projects/{project_id}/chats"
    params = {"order_by": order_by} if order_by else None

    async with httpx.AsyncClient() as client:
        response = await client.get(
            url,
            params=params,
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
async function getProjectChats(
  userId: number,
  projectId: number,
  sessionCookie: string,
  orderBy?: string
): Promise<ApiResponse> {
  const params = orderBy ? `?order_by=${orderBy}` : ''
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}/projects/${projectId}/chats${params}`,
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
- Returns only chats associated with the specified project
- The order_by parameter accepts values like "created_at:desc" or "created_at:asc"
- Multiple sort fields can be specified using comma separation
- This endpoint is read-only; use the main chats endpoint for modifications
