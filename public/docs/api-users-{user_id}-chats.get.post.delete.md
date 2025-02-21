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

| Parameter | Type    | Required | Description                   |
| --------- | ------- | -------- | ----------------------------- |
| user_id   | integer | Yes      | Unique identifier of the user |

### Headers

| Header       | Value            | Required | Description                          |
| ------------ | ---------------- | -------- | ------------------------------------ |
| Content-Type | application/json | Yes\*    | Required for POST and DELETE methods |
| Cookie       | neptun-session   | Yes      | Session authentication cookie        |

### Query Parameters

| Parameter | Type   | Required | Description                                                                                                        |
| --------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------ |
| order_by  | string | No       | Sort order for chats (format: "column:direction", e.g., "created_at:desc"). Multiple fields can be comma-separated |

### Request Body

#### POST Method

| Field | Type   | Required | Description                   | Constraints      |
| ----- | ------ | -------- | ----------------------------- | ---------------- |
| model | string | Yes      | AI model for the chat         | Non-empty string |
| name  | string | Yes      | Name of the chat conversation | Non-empty string |

#### DELETE Method

| Field    | Type     | Required | Description                 |
| -------- | -------- | -------- | --------------------------- |
| chat_ids | number[] | Yes      | Array of chat IDs to delete |

## Response Format

### Response Status Codes

| Status Code | Description                               |
| ----------- | ----------------------------------------- |
| 200         | Request successful                        |
| 400         | Invalid request body or parameters        |
| 401         | Unauthorized (invalid or missing session) |
| 404         | User not found                            |
| 500         | Server error                              |

### Success Response (200 OK)

#### GET Method

```json
{
  "chats": [
    {
      "id": 1,
      "neptun_user_id": 123,
      "model": "google/gemma-2-27b-it",
      "name": "Project Discussion",
      "created_at": "2024-03-20T10:00:00Z"
    }
  ]
}
```

#### POST Method

```json
{
  "chat": {
    "id": 1,
    "neptun_user_id": 123,
    "model": "google/gemma-2-27b-it",
    "name": "New Chat",
    "created_at": "2024-03-20T10:00:00Z"
  }
}
```

#### DELETE Method

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

### Error Response (401 Unauthorized)

```json
{
  "statusCode": 401,
  "statusMessage": "Unauthorized",
  "message": "You do not have access to view the information."
}
```

### TypeScript Interface

```typescript
interface ChatConversation {
  id: number
  neptun_user_id: number
  model: string
  name: string
  created_at: string
  updated_at: string
}

interface CreateChatRequest {
  model: string
  name: string
}

interface DeleteChatsRequest {
  chat_ids: number[]
}

interface GetChatsResponse {
  chats: ChatConversation[]
}

interface CreateChatResponse {
  chat: ChatConversation
}
```

### Python Model

```python
from pydantic import BaseModel
from typing import List
from datetime import datetime

class ChatConversation(BaseModel):
    id: int
    neptun_user_id: int
    model: str
    name: str
    created_at: datetime
    updated_at: datetime

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

### cURL Example

```bash
# GET all chats
curl -X GET \
  -H "Cookie: neptun-session=your-session-cookie" \
  "https://neptun-webui.vercel.app/api/users/your-user-id/chats"

# POST new chat
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Cookie: neptun-session=your-session-cookie" \
  -d '{
    "model": "google/gemma-2-27b-it",
    "name": "New Chat"
  }' \
  "https://neptun-webui.vercel.app/api/users/your-user-id/chats"

# DELETE chats
curl -X DELETE \
  -H "Content-Type: application/json" \
  -H "Cookie: neptun-session=your-session-cookie" \
  -d '{
    "chat_ids": [1, 2, 3]
  }' \
  "https://neptun-webui.vercel.app/api/users/your-user-id/chats"
```

### Python Example

```python
from pydantic import BaseModel
import httpx
from typing import List, Optional
from datetime import datetime

# ... (Previous model definitions) ...

async def get_user_chats(
    user_id: int,
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
    user_id: int,
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
    user_id: int,
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

### TypeScript/JavaScript Example

```typescript
// Get all chats
async function getUserChats(
  userId: number,
  orderBy?: string
): Promise<GetChatsResponse> {
  const params = orderBy ? `?order_by=${orderBy}` : ''
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}/chats${params}`,
    {
      credentials: 'include', // Important for cookie handling
    }
  )

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return await response.json() as GetChatsResponse
}

// Create new chat
async function createChat(
  userId: number,
  model: string,
  name: string
): Promise<CreateChatResponse> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}/chats`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, name }),
      credentials: 'include', // Important for cookie handling
    }
  )

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return await response.json() as CreateChatResponse
}

// Delete chats
async function deleteChats(
  userId: number,
  chatIds: number[]
): Promise<boolean> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}/chats`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ chat_ids: chatIds }),
      credentials: 'include', // Important for cookie handling
    }
  )

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return await response.json()
}
```

## Notes

- Authentication via `neptun-session` cookie is required for all operations
- The order_by parameter accepts values like "created_at:desc" or "created_at:asc"
- Chat IDs must be valid and belong to the specified user for deletion
- The model field should match one of the supported AI models
- GET requests support optional sorting through the order_by parameter
- POST requests require both model and name fields
- DELETE requests can remove multiple chats in a single operation
- Chat IDs must be valid and belong to the requesting user
- The model field in POST requests must be a supported AI model
- Deleted chats cannot be recovered
- All chat messages are also deleted when a chat is removed
