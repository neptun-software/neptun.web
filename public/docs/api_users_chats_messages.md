# Chat Messages Endpoint

## Overview

This endpoint retrieves all messages from a specific chat conversation.

## Request Details

### HTTP Method

GET

### Route

`/api/users/{user_id}/chats/{chat_id}/messages`

### Route Parameters

| Parameter | Type   | Required | Description                              |
|-----------|--------|----------|------------------------------------------|
| user_id   | string | Yes      | Unique identifier of the user           |
| chat_id   | number | Yes      | Unique identifier of the chat           |

### Headers

| Header         | Value          | Required | Description                    |
|----------------|----------------|----------|--------------------------------|
| Cookie         | neptun-session | Yes      | Session authentication cookie  |

### Query Parameters

No query parameters required.

### Request Body

No request body required.

## Response Format

### Success Response (200 OK)

```json
{
  "chatMessages": [
    {
      "id": 1,
      "chat_conversation_id": 123,
      "role": "user",
      "content": "Hello, how can I help you?",
      "created_at": "2024-03-20T10:00:00Z",
      "files": [
        {
          "id": 1,
          "title": "example.py",
          "text": "print('Hello')",
          "language": "python",
          "extension": "py"
        }
      ]
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

#### TypeScript Interface

```typescript
interface ChatFile {
  id: number;
  title: string;
  text: string;
  language: string;
  extension: string;
}

interface ChatMessage {
  id: number;
  chat_conversation_id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  files?: ChatFile[];
}

interface GetChatMessagesResponse {
  chatMessages: ChatMessage[];
}

interface GetChatMessagesError {
  statusCode: number;
  statusMessage: string;
  data: {
    message: string;
  };
}
```

#### Python Model

```python
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from enum import Enum

class MessageRole(str, Enum):
    user = "user"
    assistant = "assistant"
    system = "system"

class ChatFile(BaseModel):
    id: int
    title: str
    text: str
    language: str
    extension: str

class ChatMessage(BaseModel):
    id: int
    chat_conversation_id: int
    role: MessageRole
    content: str
    created_at: datetime
    files: Optional[List[ChatFile]] = None

class GetChatMessagesResponse(BaseModel):
    chatMessages: List[ChatMessage]
```

## Code Examples

### Python Example (using httpx)

```python
from pydantic import BaseModel
import httpx
from typing import List
from datetime import datetime

async def get_chat_messages(
    user_id: str,
    chat_id: int,
    session_cookie: str
) -> GetChatMessagesResponse:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://neptun-webui.vercel.app/api/users/{user_id}/chats/{chat_id}/messages",
            cookies={"neptun-session": session_cookie}
        )
        response.raise_for_status()
        return GetChatMessagesResponse(**response.json())
```

### cURL Example

```bash
curl -X GET \
  -H "Cookie: neptun-session=your-session-cookie" \
  "https://neptun-webui.vercel.app/api/users/your-user-id/chats/123/messages"
```

### TypeScript/JavaScript Example (using fetch)

```typescript
async function getChatMessages(
  userId: string,
  chatId: number
): Promise<GetChatMessagesResponse> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}/chats/${chatId}/messages`,
    {
      credentials: 'include', // Important for cookie handling
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json() as GetChatMessagesResponse;
}
```

### Response Status Codes

| Status Code | Description                                        |
|-------------|----------------------------------------------------|
| 200         | Successfully retrieved chat messages               |
| 401         | Unauthorized (invalid or missing session)          |
| 404         | Chat or user not found                            |
| 500         | Server error                                      |

## Notes

- The session cookie is required for authentication
- Messages are returned in chronological order
- Each message may contain optional attached files
- The role field indicates whether the message is from the user, assistant, or system
- Files associated with messages include code snippets or other text-based content
