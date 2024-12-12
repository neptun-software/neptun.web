# Chat Files Endpoint

## Overview

This endpoint retrieves all files associated with a specific chat conversation.

## Request Details

### HTTP Method

GET

### Route

`/api/users/{user_id}/chats/{chat_id}/files`

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

#### TypeScript Interface

```typescript
interface ChatFile {
  id: number;
  chat_conversation_id: number;
  name: string;
  size: number;
  type: string;
  created_at: string;
  url: string;
}

interface GetChatFilesResponse {
  chatFiles: ChatFile[];
}

interface GetChatFilesError {
  statusCode: number;
  statusMessage: string;
  data: {
    message: string;
  };
}
```

#### Python Model

```python
from pydantic import BaseModel, HttpUrl
from datetime import datetime
from typing import List

class ChatFile(BaseModel):
    id: int
    chat_conversation_id: int
    name: str
    size: int
    type: str
    created_at: datetime
    url: HttpUrl

class GetChatFilesResponse(BaseModel):
    chatFiles: List[ChatFile]

class ErrorData(BaseModel):
    message: str

class GetChatFilesError(BaseModel):
    statusCode: int
    statusMessage: str
    data: ErrorData
```

## Code Examples

### Python Example (using httpx)

```python
from pydantic import BaseModel, HttpUrl
import httpx
from typing import List
from datetime import datetime

class ChatFile(BaseModel):
    id: int
    chat_conversation_id: int
    name: str
    size: int
    type: str
    created_at: datetime
    url: HttpUrl

class GetChatFilesResponse(BaseModel):
    chatFiles: List[ChatFile]

async def get_chat_files(
    user_id: str,
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

### cURL Example

```bash
curl -X GET \
  -H "Cookie: neptun-session=your-session-cookie" \
  "https://neptun-webui.vercel.app/api/users/your-user-id/chats/123/files"
```

### TypeScript/JavaScript Example (using fetch)

```typescript
async function getChatFiles(
  userId: string,
  chatId: number
): Promise<GetChatFilesResponse> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}/chats/${chatId}/files`,
    {
      credentials: 'include', // Important for cookie handling
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json() as GetChatFilesResponse;
}
```

### Response Status Codes

| Status Code | Description                                        |
|-------------|----------------------------------------------------|
| 200         | Successfully retrieved chat files                  |
| 401         | Unauthorized (invalid or missing session)          |
| 404         | Chat or user not found                            |
| 500         | Server error                                      |

## Notes

- The session cookie is required for authentication
- The chat must belong to the specified user
- Returns an empty array if no files are associated with the chat
- File URLs may have limited-time validity
