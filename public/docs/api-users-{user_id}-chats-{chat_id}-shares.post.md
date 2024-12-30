# Create Chat Share Endpoint

## Overview

This endpoint creates a share link for a chat conversation, optionally with password protection.

## Request Details

### HTTP Method

POST

### Route

`/api/users/{user_id}/chats/{chat_id}/shares`

### Route Parameters

| Parameter | Type   | Required | Description                   |
| --------- | ------ | -------- | ----------------------------- |
| user_id   | string | Yes      | Unique identifier of the user |
| chat_id   | number | Yes      | Unique identifier of the chat |

### Headers

| Header       | Value            | Required | Description                   |
| ------------ | ---------------- | -------- | ----------------------------- |
| Content-Type | application/json | Yes      | Indicates JSON request body   |
| Cookie       | neptun-session   | Yes      | Session authentication cookie |

### Query Parameters

No query parameters required.

### Request Body

| Field           | Type    | Required | Default | Description                            |
| --------------- | ------- | -------- | ------- | -------------------------------------- |
| is_shared       | boolean | No       | true    | Whether the chat is shared             |
| is_protected    | boolean | No       | false   | Whether password protection is enabled |
| hashed_password | string  | No       | null    | Hashed password for protected shares   |

## Response Format

### Success Response (200 OK)

```json
{
  "share": {
    "id": 1,
    "chat_conversation_id": 123,
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "is_shared": true,
    "is_protected": false,
    "hashed_password": null,
    "created_at": "2024-03-20T10:00:00Z"
  }
}
```

### Error Response (400 Bad Request)

```json
{
  "statusCode": 400,
  "statusMessage": "Bad Request. Invalid body({ is_shared?(true), is_protected?(false), hashed_password?(null) }).",
  "data": {
    "issues": [
      {
        "code": "invalid_type",
        "message": "Expected boolean, received string"
      }
    ]
  }
}
```

#### TypeScript Interfaces

```typescript
interface CreateShareRequest {
  is_shared?: boolean
  is_protected?: boolean
  hashed_password?: string | null
}

interface ChatShare {
  id: number
  chat_conversation_id: number
  uuid: string
  is_shared: boolean
  is_protected: boolean
  hashed_password: string | null
  created_at: string
}

interface CreateShareResponse {
  share: ChatShare
}

interface CreateShareError {
  statusCode: number
  statusMessage: string
  data: {
    issues: Array<{
      code: string
      message: string
    }>
  }
}
```

#### Python Models

```python
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class CreateShareRequest(BaseModel):
    is_shared: bool = True
    is_protected: bool = False
    hashed_password: Optional[str] = None

class ChatShare(BaseModel):
    id: int
    chat_conversation_id: int
    uuid: UUID
    is_shared: bool
    is_protected: bool
    hashed_password: Optional[str]
    created_at: datetime

class CreateShareResponse(BaseModel):
    share: ChatShare
```

## Code Examples

### Python Example (using httpx)

```python
async def create_chat_share(
    user_id: str,
    chat_id: int,
    share_request: CreateShareRequest,
    session_cookie: str
) -> CreateShareResponse:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"https://neptun-webui.vercel.app/api/users/{user_id}/chats/{chat_id}/shares",
            json=share_request.dict(exclude_none=True),
            cookies={"neptun-session": session_cookie}
        )
        response.raise_for_status()
        return CreateShareResponse(**response.json())
```

### cURL Example

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Cookie: neptun-session=your-session-cookie" \
  -d '{
    "is_shared": true,
    "is_protected": false
  }' \
  "https://neptun-webui.vercel.app/api/users/your-user-id/chats/123/shares"
```

### TypeScript/JavaScript Example (using fetch)

```typescript
async function createChatShare(
  userId: string,
  chatId: number,
  shareRequest: CreateShareRequest
): Promise<CreateShareResponse> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}/chats/${chatId}/shares`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(shareRequest),
      credentials: 'include', // Important for cookie handling
    }
  )

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return await response.json() as CreateShareResponse
}
```

### Response Status Codes

| Status Code | Description                               |
| ----------- | ----------------------------------------- |
| 200         | Share successfully created                |
| 400         | Invalid request body                      |
| 401         | Unauthorized (invalid or missing session) |
| 404         | Chat or user not found                    |
| 500         | Server error during share creation        |

## Notes

- The session cookie is required for authentication
- The UUID in the response can be used to construct a public share URL
- If is_protected is true, a hashed_password must be provided
- The share can be disabled by setting is_shared to false
- Only one active share can exist per chat conversation
