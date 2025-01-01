# Shared Chat Messages Endpoint

## Overview

This endpoint retrieves messages from a shared chat conversation. It supports password protection and whitelist-based access control.

## Request Details

### HTTP Method

GET

### Route

`/api/shared/chats/{uuid}`

### Route Parameters

| Parameter | Type   | Required | Description                          |
| --------- | ------ | -------- | ------------------------------------ |
| uuid      | string | Yes      | Unique identifier of the shared chat |

### Headers

| Header       | Value            | Required | Description                   |
| ------------ | ---------------- | -------- | ----------------------------- |
| Content-Type | application/json | Yes      | Indicates JSON request body   |
| Cookie       | neptun-session   | No       | Session authentication cookie |

### Query Parameters

No query parameters required.

### Request Body

No request body required.

## Response Format

### Response Status Codes

| Status Code | Description                                |
| ----------- | ------------------------------------------ |
| 200         | Successfully retrieved chat messages       |
| 401         | Unauthorized (missing or invalid password) |
| 403         | Forbidden (not on whitelist)               |
| 404         | Share not found                            |
| 500         | Server error                               |

### Success Response (200 OK)

```json
{
  "chatMessages": [
    {
      "id": 123,
      "content": "Hello world",
      "role": "user",
      "timestamp": "2024-03-20T10:30:00Z"
    }
  ],
  "shareInfo": {
    "shareExists": true,
    "shareIsPrivate": true,
    "shareHasPassword": true,
    "shareHasWhitelist": false
  }
}
```

### Error Responses

#### Not Found (404)

```json
{
  "statusCode": 404,
  "statusMessage": "Not Found (share not found)",
  "message": "The share does not exist.",
  "data": {
    "shareInfo": {
      "shareExists": false,
      "shareIsPrivate": false,
      "shareHasPassword": false,
      "shareHasWhitelist": false
    }
  }
}
```

#### Unauthorized (401)

```json
{
  "statusCode": 401,
  "statusMessage": "Unauthorized (incorrect credentials)",
  "message": "You are not authorized to view this chat.",
  "data": {
    "shareInfo": {
      "shareExists": true,
      "shareIsPrivate": true,
      "shareHasPassword": true,
      "shareHasWhitelist": false
    }
  }
}
```

### TypeScript Interface

```typescript
interface ChatMessage {
  id: number
  content: string
  role: 'user' | 'assistant'
  created_at: string
  updated_at: string
}

interface ShareInfo {
  shareExists: boolean
  shareIsActive: boolean
  shareIsPrivate: boolean
  shareHasPassword: boolean
  shareHasWhitelist: boolean
}

interface SharedChatResponse {
  chatMessages: ChatMessage[]
  shareInfo: ShareInfo
}

interface SharedChatError {
  statusCode: number
  statusMessage: string
  message: string
  data: {
    shareInfo: ShareInfo
  }
}
```

### Python Model

```python
from pydantic import BaseModel
from typing import List
from datetime import datetime

class ChatMessage(BaseModel):
    id: int
    content: str
    role: Literal['user', 'assistant']
    created_at: datetime
    updated_at: datetime

class ShareInfo(BaseModel):
    shareExists: bool
    shareIsActive: bool
    shareIsPrivate: bool
    shareHasPassword: bool
    shareHasWhitelist: bool

class SharedChatResponse(BaseModel):
    chatMessages: List[ChatMessage]
    shareInfo: ShareInfo

class SharedChatError(BaseModel):
    statusCode: int
    statusMessage: str
    message: str
    data: dict[str, ShareInfo]
```

## Code Examples

### cURL Example

```bash
curl -X GET "https://neptun-webui.vercel.app/api/shared/chats/your-uuid-here" \
  -H "Cookie: neptun-session=your-session-cookie"
```

### Python Example

```python
from pydantic import BaseModel
import httpx
from typing import List
from datetime import datetime

async def get_shared_chat(
    uuid: str,
    session_cookie: str
) -> SharedChatResponse:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://neptun-webui.vercel.app/api/shared/chats/{uuid}",
            cookies={"neptun-session": session_cookie}
        )
        response.raise_for_status()
        return SharedChatResponse(**response.json())
```

### TypeScript/JavaScript Example

```typescript
async function getSharedChat(uuid: string): Promise<SharedChatResponse> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/shared/chats/${uuid}`,
    {
      credentials: 'include', // Important for cookie handling
    }
  )

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return await response.json() as SharedChatResponse
}
```

## Notes

- The endpoint supports both password-protected and whitelist-based access control
- The shareInfo object provides information about the share's protection status
- Session cookie is required for authentication if the share is protected
- Error responses include detailed share information for better error handling
