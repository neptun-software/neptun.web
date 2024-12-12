# User Chats Endpoint

## Overview

This endpoint manages chat conversations for a specific user, supporting creation, deletion, and retrieval of chats.

## Request Details

### HTTP Methods

- GET: Retrieve all chats
- POST: Create a new chat
- DELETE: Delete one or more chats

### Route

`/api/users/{user_id}/chats`

### Route Parameters

| Parameter | Type   | Required | Description                    |
|-----------|--------|----------|--------------------------------|
| user_id   | string | Yes      | Unique identifier of the user  |

### Headers

| Header         | Value            | Required | Description                          |
|----------------|------------------|----------|--------------------------------------|
| Content-Type   | application/json | Yes*     | Required for POST and DELETE methods |
| Cookie         | neptun-session   | Yes      | Session authentication cookie        |

### Query Parameters

| Parameter | Type   | Required | Description                                     |
|-----------|--------|----------|-------------------------------------------------|
| order_by  | string | No       | Sort order for chats (e.g., "created_at:desc") |

### Request Body

#### POST Method

| Field  | Type   | Required | Description                    | Constraints        |
|--------|--------|----------|--------------------------------|-------------------|
| model  | string | Yes      | AI model for the chat         | Non-empty string  |
| name   | string | Yes      | Name of the chat conversation | Non-empty string  |

#### DELETE Method

| Field     | Type     | Required | Description                          |
|-----------|----------|----------|--------------------------------------|
| chat_ids  | number[] | Yes      | Array of chat IDs to delete         |

## Response Format

### GET Success Response (200 OK)

```json
{
  "chats": [
    {
      "id": 1,
      "neptun_user_id": "user123",
      "model": "gpt-3.5",
      "name": "Project Discussion",
      "created_at": "2024-03-20T10:00:00Z"
    }
  ]
}
```

### POST Success Response (200 OK)

```json
{
  "chat": {
    "id": 1,
    "neptun_user_id": "user123",
    "model": "gpt-3.5",
    "name": "New Chat",
    "created_at": "2024-03-20T10:00:00Z"
  }
}
```

### DELETE Success Response (200 OK)

Returns true if deletion was successful.

```json
true
```

### Error Response (400 Bad Request)

```json
{
  "statusCode": 400,
  "statusMessage": "Bad Request. Invalid body(model, name).",
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

#### TypeScript Interfaces

```typescript
interface ChatConversation {
  id: number;
  neptun_user_id: string;
  model: string;
  name: string;
  created_at: string;
}

interface CreateChatRequest {
  model: string;
  name: string;
}

interface DeleteChatsRequest {
  chat_ids: number[];
}

interface GetChatsResponse {
  chats: ChatConversation[];
}

interface CreateChatResponse {
  chat: ChatConversation;
}
```

#### Python Models

```python
from pydantic import BaseModel
from typing import List
from datetime import datetime

class ChatConversation(BaseModel):
    id: int
    neptun_user_id: str
    model: str
    name: str
    created_at: datetime

class CreateChatRequest(BaseModel):
    model: str
    name: str

class DeleteChatsRequest(BaseModel):
    chat_ids: List[int]

class GetChatsResponse(BaseModel):
    chats: List[ChatConversation]

class CreateChatResponse(BaseModel):
    chat: ChatConversation
```

## Code Examples

### Python Example (using httpx)

```python
from pydantic import BaseModel
import httpx
from typing import List, Optional
from datetime import datetime

# ... (Previous model definitions) ...

async def get_user_chats(
    user_id: str,
    session_cookie: str,
    order_by: Optional[str] = None
) -> GetChatsResponse:
    async with httpx.AsyncClient() as client:
        params = {"order_by": order_by} if order_by else None
        response = await client.get(
            f"https://neptun-webui.vercel.app/api/users/{user_id}/chats",
            params=params,
            cookies={"neptun-session": session_cookie}
        )
        response.raise_for_status()
        return GetChatsResponse(**response.json())

async def create_chat(
    user_id: str,
    session_cookie: str,
    model: str,
    name: str
) -> CreateChatResponse:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"https://neptun-webui.vercel.app/api/users/{user_id}/chats",
            json={"model": model, "name": name},
            cookies={"neptun-session": session_cookie}
        )
        response.raise_for_status()
        return CreateChatResponse(**response.json())

async def delete_chats(
    user_id: str,
    session_cookie: str,
    chat_ids: List[int]
) -> bool:
    async with httpx.AsyncClient() as client:
        response = await client.delete(
            f"https://neptun-webui.vercel.app/api/users/{user_id}/chats",
            json={"chat_ids": chat_ids},
            cookies={"neptun-session": session_cookie}
        )
        response.raise_for_status()
        return response.json()
```

### Response Status Codes

| Status Code | Description                                        |
|-------------|----------------------------------------------------|
| 200         | Request successful                                |
| 400         | Invalid request body or parameters                |
| 401         | Unauthorized (invalid or missing session)         |
| 404         | User not found                                   |
| 500         | Server error                                     |

## Notes

- The session cookie is required for all operations
- The order_by parameter accepts values like "created_at:desc" or "created_at:asc"
- Chat IDs must be valid and belong to the specified user for deletion
- The model field should match one of the supported AI models
