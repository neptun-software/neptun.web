# Project Chats Batch Deletion Endpoint

## Overview

This endpoint allows users to delete multiple chat conversations associated with a specific project.

## Request Details

### HTTP Method

DELETE

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

| Field    | Type     | Required | Description                 |
| -------- | -------- | -------- | --------------------------- |
| chat_ids | number[] | Yes      | Array of chat IDs to delete |

## Response Format

### Response Status Codes

| Status Code | Description                               |
| ----------- | ----------------------------------------- |
| 200         | Successfully deleted chats                |
| 400         | Bad Request (invalid request body)        |
| 401         | Unauthorized (invalid or missing session) |
| 404         | Project not found                         |
| 500         | Server error                              |

### Success Response (200 OK)

Returns `true` on successful deletion.

```json
true
```

### Error Response (400 Bad Request)

```json
{
  "statusCode": 400,
  "statusMessage": "Bad Request",
  "message": "Invalid body(chat_ids)"
}
```

### TypeScript Interface

```typescript
interface DeleteChatsRequest {
  chat_ids: number[]
}

type ApiResponse = boolean
```

### Python Model

```python
from pydantic import BaseModel
from typing import List

class DeleteChatsRequest(BaseModel):
    chat_ids: List[int]

class ApiResponse(BaseModel):
    success: bool
```

## Code Examples

### cURL Example

```bash
curl -X DELETE "https://neptun-webui.vercel.app/api/users/1/projects/1/chats" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Cookie: neptun-session=your-session-cookie" \
  -d '{
    "chat_ids": [1, 2, 3]
  }'
```

### Python Example

```python
import httpx
from typing import List

async def delete_project_chats(
    user_id: int,
    project_id: int,
    chat_ids: List[int],
    session_cookie: str
) -> bool:
    url = f"https://neptun-webui.vercel.app/api/users/{user_id}/projects/{project_id}/chats"

    async with httpx.AsyncClient() as client:
        response = await client.delete(
            url,
            json={"chat_ids": chat_ids},
            headers={
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Cookie": f"neptun-session={session_cookie}"
            }
        )
        response.raise_for_status()
        return response.json()
```

### TypeScript/JavaScript Example

```typescript
async function deleteProjectChats(
  userId: number,
  projectId: number,
  chatIds: number[],
  sessionCookie: string
): Promise<boolean> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}/projects/${projectId}/chats`,
    {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Cookie': `neptun-session=${sessionCookie}`,
      },
      body: JSON.stringify({ chat_ids: chatIds }),
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
- All chats must belong to the specified project
- The operation will fail if any of the chats cannot be deleted
- This operation cannot be undone
- Both the project-chat links and the actual chat conversations will be deleted
