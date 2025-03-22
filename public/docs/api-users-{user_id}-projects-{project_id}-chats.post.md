# Project Chat Creation Endpoint

## Overview

This endpoint allows users to create a new chat conversation and associate it with a specific project.

## Request Details

### HTTP Method

POST

### Route

`/api/users/{user_id}/projects/{project_id}/chats`

### Route Parameters

| Parameter  | Type    | Required | Description                      |
| ---------- | ------- | -------- | -------------------------------- |
| user_id    | integer | Yes      | The ID of the authenticated user |
| project_id | integer | Yes      | The ID of the project            |

### Headers

| Header       | Value            | Required | Description                   |
| ------------ | ---------------- | -------- | ----------------------------- |
| Accept       | application/json | Yes      | Specifies the response format |
| Content-Type | application/json | Yes      | Request body format           |
| Cookie       | neptun-session   | Yes      | Session authentication cookie |

### Request Body

| Field | Type   | Required | Description                       |
| ----- | ------ | -------- | --------------------------------- |
| model | string | Yes      | The AI model to use for the chat  |
| name  | string | Yes      | The name of the chat conversation |

## Response Format

### Response Status Codes

| Status Code | Description                               |
| ----------- | ----------------------------------------- |
| 201         | Successfully created chat                 |
| 400         | Bad Request (invalid request body)        |
| 401         | Unauthorized (invalid or missing session) |
| 404         | Project not found                         |
| 500         | Server error                              |

### Success Response (201 Created)

```json
{
  "chat": {
    "id": 1,
    "neptun_user_id": 123,
    "model": "google/gemma-2-27b-it",
    "name": "Project Discussion",
    "created_at": "2024-03-20T10:00:00Z",
    "updated_at": "2024-03-20T10:00:00Z"
  }
}
```

### Error Response (400 Bad Request)

```json
{
  "statusCode": 400,
  "statusMessage": "Bad Request",
  "message": "Invalid body(model, name)"
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

interface ApiResponse {
  chat: ChatConversation
}
```

### Python Model

```python
from datetime import datetime
from pydantic import BaseModel

class CreateChatRequest(BaseModel):
    model: str
    name: str

class ChatConversation(BaseModel):
    id: int
    neptun_user_id: int
    model: str
    name: str
    created_at: datetime
    updated_at: datetime

class ApiResponse(BaseModel):
    chat: ChatConversation
```

## Code Examples

### cURL Example

```bash
curl -X POST "https://neptun-webui.vercel.app/api/users/1/projects/1/chats" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Cookie: neptun-session=your-session-cookie" \
  -d '{
    "model": "google/gemma-2-27b-it",
    "name": "Project Discussion"
  }'
```

### Python Example

```python
import httpx
from typing import Optional

async def create_project_chat(
    user_id: int,
    project_id: int,
    model: str,
    name: str,
    session_cookie: str
) -> ApiResponse:
    url = f"https://neptun-webui.vercel.app/api/users/{user_id}/projects/{project_id}/chats"

    async with httpx.AsyncClient() as client:
        response = await client.post(
            url,
            json={
                "model": model,
                "name": name
            },
            headers={
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Cookie": f"neptun-session={session_cookie}"
            }
        )
        response.raise_for_status()
        return ApiResponse(**response.json())
```

### TypeScript/JavaScript Example

```typescript
async function createProjectChat(
  userId: number,
  projectId: number,
  data: CreateChatRequest,
  sessionCookie: string
): Promise<ApiResponse> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}/projects/${projectId}/chats`,
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Cookie': `neptun-session=${sessionCookie}`,
      },
      body: JSON.stringify(data),
    }
  )

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return await response.json()
}
```

## Notes

- The session cookie is required for authentication
- The project must exist and belong to the specified user
- The model must be a valid AI model identifier
- The chat will be automatically linked to the project upon creation
