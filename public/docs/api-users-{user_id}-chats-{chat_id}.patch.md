# Update Chat Endpoint

## Overview

This endpoint updates the properties of a specific chat conversation, currently supporting chat name updates.

## Request Details

### HTTP Method

PATCH

### Route

`/api/users/{user_id}/chats/{chat_id}`

### Route Parameters

| Parameter | Type    | Required | Description                             |
| --------- | ------- | -------- | --------------------------------------- |
| user_id   | integer | Yes      | Unique identifier of the user           |
| chat_id   | integer | Yes      | Unique identifier of the chat to update |

### Headers

| Header       | Value            | Required | Description                   |
| ------------ | ---------------- | -------- | ----------------------------- |
| Content-Type | application/json | Yes      | Indicates JSON request body   |
| Cookie       | neptun-session   | Yes      | Session authentication cookie |

### Query Parameters

No query parameters required.

### Request Body

| Field | Type   | Required | Description           | Constraints      |
| ----- | ------ | -------- | --------------------- | ---------------- |
| name  | string | Yes      | New name for the chat | Non-empty string |

## Response Format

### Response Status Codes

| Status Code | Description                               |
| ----------- | ----------------------------------------- |
| 200         | Chat successfully updated                 |
| 400         | Invalid request body                      |
| 401         | Unauthorized (invalid or missing session) |
| 404         | Chat or user not found                    |
| 500         | Server error during update                |

### Success Response (200 OK)

```json
{
  "chat": {
    "id": 123,
    "neptun_user_id": "user123",
    "name": "Updated Chat Name",
    "model": "gpt-3.5",
    "created_at": "2024-03-20T10:00:00Z"
  }
}
```

### Error Response (400 Bad Request)

```json
{
  "statusCode": 400,
  "statusMessage": "Bad Request. Invalid body(name).",
  "data": {
    "issues": [
      {
        "code": "invalid_type",
        "message": "Required"
      }
    ]
  }
}
```

### TypeScript Interface

```typescript
interface UpdateChatRequest {
  name: string
}

interface ChatConversation {
  id: number
  neptun_user_id: number
  name: string
  model: string
  created_at: string
  updated_at: string
}

interface UpdateChatResponse {
  chat: ChatConversation
}
```

### Python Model

```python
from pydantic import BaseModel
from datetime import datetime

class UpdateChatRequest(BaseModel):
    name: str

class ChatConversation(BaseModel):
    id: int
    neptun_user_id: int
    name: str
    model: str
    created_at: datetime
    updated_at: datetime

class UpdateChatResponse(BaseModel):
    chat: ChatConversation
```

## Code Examples

### cURL Example

```bash
curl -X PATCH \
  -H "Content-Type: application/json" \
  -H "Cookie: neptun-session=your-session-cookie" \
  -d '{"name": "New Chat Name"}' \
  "https://neptun-webui.vercel.app/api/users/your-user-id/chats/123"
```

### Python Example

```python
from pydantic import BaseModel
import httpx
from datetime import datetime

class UpdateChatRequest(BaseModel):
    name: str

class ChatConversation(BaseModel):
    id: int
    neptun_user_id: int
    name: str
    model: str
    created_at: datetime
    updated_at: datetime

class UpdateChatResponse(BaseModel):
    chat: ChatConversation

async def update_chat(
    user_id: int,
    chat_id: int,
    name: str,
    session_cookie: str
) -> UpdateChatResponse:
    async with httpx.AsyncClient() as client:
        response = await client.patch(
            f"https://neptun-webui.vercel.app/api/users/{user_id}/chats/{chat_id}",
            json={"name": name},
            cookies={"neptun-session": session_cookie}
        )
        response.raise_for_status()
        return UpdateChatResponse(**response.json())
```

### TypeScript/JavaScript Example

```typescript
async function updateChat(
  userId: number,
  chatId: number,
  name: string
): Promise<UpdateChatResponse> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}/chats/${chatId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
      credentials: 'include', // Important for cookie handling
    }
  )

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return await response.json() as UpdateChatResponse
}
```

## Notes

- The session cookie is required for authentication
- Only the chat name can be updated through this endpoint
- The chat must belong to the specified user
- The new name must be a non-empty string
