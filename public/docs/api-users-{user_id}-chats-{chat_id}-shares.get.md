# Get Chat Share Status Endpoint

## Overview

This endpoint checks if a chat conversation has an active share and returns its UUID if it exists.

## Request Details

### HTTP Method

GET

### Route

`/api/users/{user_id}/chats/{chat_id}/shares`

### Route Parameters

| Parameter | Type    | Required | Description                   |
| --------- | ------- | -------- | ----------------------------- |
| user_id   | integer | Yes      | Unique identifier of the user |
| chat_id   | integer | Yes      | Unique identifier of the chat |

### Headers

| Header | Value          | Required | Description                   |
| ------ | -------------- | -------- | ----------------------------- |
| Cookie | neptun-session | Yes      | Session authentication cookie |

### Query Parameters

No query parameters required.

### Request Body

No request body required.

## Response Format

### Response Status Codes

| Status Code | Description                               |
| ----------- | ----------------------------------------- |
| 200         | Request successful                        |
| 401         | Unauthorized (invalid or missing session) |
| 404         | Chat or user not found                    |
| 500         | Server error                              |

### Success Response (200 OK)

#### When Share Exists

```json
{
  "uuid": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### When No Share Exists

```json
null
```

### Error Response (404 Not Found)

```json
{
  "statusCode": 404,
  "statusMessage": "Not Found",
  "data": {
    "message": "Chat not found"
  }
}
```

### TypeScript Interface

```typescript
interface ChatShareResponse {
  uuid: string | null
}

interface ChatShareError {
  statusCode: number
  statusMessage: string
  data: {
    message: string
  }
}
```

### Python Model

```python
from pydantic import BaseModel
from typing import Optional
from uuid import UUID

class ChatShareResponse(BaseModel):
    uuid: Optional[UUID] = None

class ErrorData(BaseModel):
    message: str

class ChatShareError(BaseModel):
    statusCode: int
    statusMessage: str
    data: ErrorData
```

## Code Examples

### Python Example

```python
from uuid import UUID
import httpx
from typing import Optional

async def get_chat_share(
    user_id: int,
    chat_id: int,
    session_cookie: str
) -> Optional[UUID]:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://neptun-webui.vercel.app/api/users/{user_id}/chats/{chat_id}/shares",
            cookies={"neptun-session": session_cookie}
        )
        response.raise_for_status()
        data = response.json()
        return UUID(data["uuid"]) if data and "uuid" in data else None
```

### cURL Example

```bash
curl -X GET \
  -H "Cookie: neptun-session=your-session-cookie" \
  "https://neptun-webui.vercel.app/api/users/your-user-id/chats/123/shares"
```

### TypeScript/JavaScript Example

```typescript
async function getChatShare(
  userId: number,
  chatId: number
): Promise<string | null> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}/chats/${chatId}/shares`,
    {
      credentials: 'include', // Important for cookie handling
    }
  )

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data = await response.json()
  return data ? data.uuid : null
}
```

## Notes

- The session cookie is required for authentication
- Returns null if no share exists for the chat
- The UUID is a unique identifier for the share
- The share status can be used to determine if a chat is publicly accessible
- The UUID can be used to construct a public share URL
