# Chat Files Endpoint

## Overview

This endpoint retrieves all files associated with a specific chat conversation.

## Request Details

### HTTP Method

GET

### Route

`/api/users/{user_id}/chats/{chat_id}/files`

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
| 200         | Successfully retrieved chat files         |
| 401         | Unauthorized (invalid or missing session) |
| 404         | Chat or user not found                    |
| 500         | Server error                              |

### Success Response (200 OK)

```json
{
  "chatFiles": [
    {
      "id": 1,
      "chat_conversation_id": 123,
      "name": "document.pdf",
      "size": 1024,
      "type": "application/pdf",
      "created_at": "2024-03-20T10:00:00Z",
      "url": "https://storage.example.com/files/document.pdf"
    }
  ]
}
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
interface ChatFile {
  id: number
  chat_conversation_id: number
  chat_conversation_message_id: number
  neptun_user_id: number
  title: string
  text: string
  language: string
  extension: string
  created_at: string
  updated_at: string
}

interface GetChatFilesResponse {
  chatFiles: ChatFile[]
}

interface GetChatFilesError {
  statusCode: number
  statusMessage: string
  data: {
    message: string
  }
}
```

### Python Model

```python
from pydantic import BaseModel, HttpUrl
from datetime import datetime
from typing import List

class ChatFile(BaseModel):
    id: int
    chat_conversation_id: int
    chat_conversation_message_id: int
    neptun_user_id: int
    title: str
    text: str
    language: str = "text"
    extension: str = "txt"
    created_at: datetime
    updated_at: datetime

class GetChatFilesResponse(BaseModel):
    chatFiles: List[ChatFile]

class GetChatFilesError(BaseModel):
    statusCode: int
    statusMessage: str
    data: dict
```

## Code Examples

### cURL Example

```bash
curl -X GET \
  -H "Cookie: neptun-session=your-session-cookie" \
  "https://neptun-webui.vercel.app/api/users/your-user-id/chats/123/files"
```

### Python Example

```python
from pydantic import BaseModel, HttpUrl
import httpx
from typing import List
from datetime import datetime

class ChatFile(BaseModel):
    id: int
    chat_conversation_id: int
    chat_conversation_message_id: int
    neptun_user_id: int
    title: str
    text: str
    language: str = "text"
    extension: str = "txt"
    created_at: datetime
    updated_at: datetime

class GetChatFilesResponse(BaseModel):
    chatFiles: List[ChatFile]

async def get_chat_files(
    user_id: int,
    chat_id: int,
    session_cookie: str
) -> GetChatFilesResponse:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://neptun-webui.vercel.app/api/users/{user_id}/chats/{chat_id}/files",
            cookies={"neptun-session": session_cookie}
        )
        response.raise_for_status()
        return GetChatFilesResponse(**response.json())
```

### TypeScript/JavaScript Example

```typescript
async function getChatFiles(
  userId: number,
  chatId: number
): Promise<GetChatFilesResponse> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}/chats/${chatId}/files`,
    {
      credentials: 'include', // Important for cookie handling
    }
  )

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return await response.json() as GetChatFilesResponse
}
```

## Notes

- The session cookie is required for authentication
- The chat must belong to the specified user
- Returns an empty array if no files are associated with the chat
- File URLs may have limited-time validity
