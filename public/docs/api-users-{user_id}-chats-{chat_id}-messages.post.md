# Create Chat Messages Endpoint

## Overview

This endpoint creates one or multiple messages in a chat conversation.

## Request Details

### HTTP Method

POST

### Route

`/api/users/{user_id}/chats/{chat_id}/messages`

### Route Parameters

| Parameter | Type    | Required | Description                   |
| --------- | ------- | -------- | ----------------------------- |
| user_id   | integer | Yes      | Unique identifier of the user |
| chat_id   | integer | Yes      | Unique identifier of the chat |

### Headers

| Header       | Value            | Required | Description                   |
| ------------ | ---------------- | -------- | ----------------------------- |
| Content-Type | application/json | Yes      | Indicates JSON request body   |
| Cookie       | neptun-session   | Yes      | Session authentication cookie |

### Query Parameters

No query parameters required.

### Request Body

The endpoint accepts two types of request bodies:

#### Single Message

| Field   | Type   | Required | Description                |
| ------- | ------ | -------- | -------------------------- |
| message | string | Yes      | Content of the message     |
| actor   | string | Yes      | Role of the message sender |

#### Multiple Messages

| Field    | Type           | Required | Description              |
| -------- | -------------- | -------- | ------------------------ |
| messages | MessageInput[] | Yes      | Array of message objects |

Where MessageInput contains:

- content: string (message content)
- role: string (user/assistant/system)

## Response Format

### Response Status Codes

| Status Code | Description                               |
| ----------- | ----------------------------------------- |
| 200         | Messages successfully created             |
| 400         | Invalid request body                      |
| 401         | Unauthorized (invalid or missing session) |
| 404         | Chat or user not found                    |
| 500         | Server error                              |

### Success Response (200 OK)

#### Single Message Creation

```json
{
  "chatMessage": {
    "id": 1,
    "chat_conversation_id": 123,
    "neptun_user_id": "user123",
    "message": "Hello, how can I help?",
    "actor": "assistant",
    "created_at": "2024-03-20T10:00:00Z"
  }
}
```

#### Multiple Messages Creation

```json
{
  "chatMessages": [
    {
      "id": 1,
      "chat_conversation_id": 123,
      "neptun_user_id": "user123",
      "message": "What is Python?",
      "actor": "user",
      "created_at": "2024-03-20T10:00:00Z"
    },
    {
      "id": 2,
      "chat_conversation_id": 123,
      "neptun_user_id": "user123",
      "message": "Python is a programming language...",
      "actor": "assistant",
      "created_at": "2024-03-20T10:00:01Z"
    }
  ]
}
```

### Error Response (400 Bad Request)

```json
{
  "statusCode": 400,
  "statusMessage": "Bad Request. Invalid body(message | messages).",
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
interface MessageInput {
  content: string
  role: 'user' | 'assistant'
}

interface SingleMessageRequest {
  message: string
  actor: 'user' | 'assistant'
}

interface MultipleMessagesRequest {
  messages: MessageInput[]
}

interface ChatMessage {
  id: number
  chat_conversation_id: number
  neptun_user_id: number
  message: string
  actor: 'user' | 'assistant'
  created_at: string
  updated_at: string
}

interface SingleMessageResponse {
  chatMessage: ChatMessage
}

interface MultipleMessagesResponse {
  chatMessages: ChatMessage[]
}

interface CreateMessagesError {
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

### Python Model

```python
from pydantic import BaseModel
from typing import List
from datetime import datetime
from enum import Enum

class MessageRole(str, Enum):
    user = "user"
    assistant = "assistant"

class MessageInput(BaseModel):
    content: str
    role: MessageRole

class SingleMessageRequest(BaseModel):
    message: str
    actor: MessageRole

class MultipleMessagesRequest(BaseModel):
    messages: List[MessageInput]

class ChatMessage(BaseModel):
    id: int
    chat_conversation_id: int
    neptun_user_id: int
    message: str
    actor: MessageRole
    created_at: datetime
    updated_at: datetime

class SingleMessageResponse(BaseModel):
    chatMessage: ChatMessage

class MultipleMessagesResponse(BaseModel):
    chatMessages: List[ChatMessage]
```

## Code Examples

### cURL Example

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Cookie: neptun-session=your-session-cookie" \
  -d '{
    "messages": [
      {
        "content": "What is Python?",
        "role": "user"
      },
      {
        "content": "Python is a programming language...",
        "role": "assistant"
      }
    ]
  }' \
  "https://neptun-webui.vercel.app/api/users/your-user-id/chats/123/messages"
```

### Python Example

```python
async def create_chat_messages(
    user_id: int,
    chat_id: int,
    messages: List[MessageInput],
    session_cookie: str
) -> MultipleMessagesResponse:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"https://neptun-webui.vercel.app/api/users/{user_id}/chats/{chat_id}/messages",
            json={"messages": [msg.dict() for msg in messages]},
            cookies={"neptun-session": session_cookie}
        )
        response.raise_for_status()
        return MultipleMessagesResponse(**response.json())
```

### TypeScript/JavaScript Example

```typescript
async function createChatMessages(
  userId: number,
  chatId: number,
  messages: MessageInput[]
): Promise<MultipleMessagesResponse> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}/chats/${chatId}/messages`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for cookie handling
      body: JSON.stringify({ messages }),
    }
  )

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return await response.json() as MultipleMessagesResponse
}
```

## Notes

- The session cookie is required for authentication
- Messages can be created individually or in batches
- The actor/role must be one of: "user", "assistant", or "system"
- Messages are created in the order they appear in the array
- All messages in a batch must belong to the same chat conversation
