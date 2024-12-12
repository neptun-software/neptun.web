# Delete Last Messages Endpoint

## Overview

This endpoint deletes the last message exchange (user and assistant messages) from a chat conversation. It also handles cleanup of any trailing user messages.

## Request Details

### HTTP Method

DELETE

### Route

`/api/users/{user_id}/chats/{chat_id}/messages/last`

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

#### Case 1: Normal Message Pair Deletion

```json
{
  "maybeAssistantMessageToDelete": {
    "id": 2,
    "chat_conversation_id": 123,
    "actor": "assistant",
    "message": "Here's the explanation...",
    "created_at": "2024-03-20T10:00:01Z"
  },
  "maybeUserMessageToDelete": {
    "id": 1,
    "chat_conversation_id": 123,
    "actor": "user",
    "message": "Can you explain this?",
    "created_at": "2024-03-20T10:00:00Z"
  }
}
```

#### Case 2: Trailing User Messages Cleanup

```json
{
  "deletedSuccessfully": [123, 124, 125],
  "failedToDelete": []
}
```

### Error Response (400 Bad Request)

```json
{
  "statusCode": 400,
  "statusMessage": "Bad Request.",
  "data": "No messages found, for chat."
}
```

#### TypeScript Interfaces

```typescript
interface ChatMessage {
  id: number;
  chat_conversation_id: number;
  actor: 'user' | 'assistant' | 'system';
  message: string;
  created_at: string;
}

interface DeleteLastMessagesResponse {
  maybeAssistantMessageToDelete?: ChatMessage;
  maybeUserMessageToDelete?: ChatMessage;
  deletedSuccessfully?: number[];
  failedToDelete?: number[];
}

interface DeleteLastMessagesError {
  statusCode: number;
  statusMessage: string;
  data: string;
}
```

#### Python Models

```python
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from enum import Enum

class MessageRole(str, Enum):
    user = "user"
    assistant = "assistant"
    system = "system"

class ChatMessage(BaseModel):
    id: int
    chat_conversation_id: int
    actor: MessageRole
    message: str
    created_at: datetime

class DeleteLastMessagesResponse(BaseModel):
    maybeAssistantMessageToDelete: Optional[ChatMessage] = None
    maybeUserMessageToDelete: Optional[ChatMessage] = None
    deletedSuccessfully: Optional[List[int]] = None
    failedToDelete: Optional[List[int]] = None
```

## Code Examples

### Python Example (using httpx)

```python
async def delete_last_messages(
    user_id: str,
    chat_id: int,
    session_cookie: str
) -> DeleteLastMessagesResponse:
    async with httpx.AsyncClient() as client:
        response = await client.delete(
            f"https://neptun-webui.vercel.app/api/users/{user_id}/chats/{chat_id}/messages/last",
            cookies={"neptun-session": session_cookie}
        )
        response.raise_for_status()
        return DeleteLastMessagesResponse(**response.json())
```

### cURL Example

```bash
curl -X DELETE \
  -H "Cookie: neptun-session=your-session-cookie" \
  "https://neptun-webui.vercel.app/api/users/your-user-id/chats/123/messages/last"
```

### TypeScript/JavaScript Example (using fetch)

```typescript
async function deleteLastMessages(
  userId: string,
  chatId: number
): Promise<DeleteLastMessagesResponse> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}/chats/${chatId}/messages/last`,
    {
      method: 'DELETE',
      credentials: 'include', // Important for cookie handling
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json() as DeleteLastMessagesResponse;
}
```

### Response Status Codes

| Status Code | Description                                        |
|-------------|----------------------------------------------------|
| 200         | Messages successfully deleted                      |
| 400         | No messages found in chat                         |
| 401         | Unauthorized (invalid or missing session)          |
| 404         | Chat or user not found                            |
| 500         | Server error                                      |

## Notes

- The session cookie is required for authentication
- The endpoint handles two scenarios:
  1. Deleting the last user-assistant message pair
  2. Cleaning up trailing user messages
- Messages are permanently deleted and cannot be recovered
- The operation is atomic - either all specified messages are deleted or none
- The response format varies depending on the deletion scenario
