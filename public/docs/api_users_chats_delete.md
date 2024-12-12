# Delete Chat Endpoint

## Overview

This endpoint deletes a specific chat conversation for a user.

## Request Details

### HTTP Method

DELETE

### Route

`/api/users/{user_id}/chats/{chat_id}`

### Route Parameters

| Parameter | Type   | Required | Description                              |
|-----------|--------|----------|------------------------------------------|
| user_id   | string | Yes      | Unique identifier of the user           |
| chat_id   | number | Yes      | Unique identifier of the chat to delete |

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

Returns a boolean indicating whether the deletion was successful.

```json
true
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
interface DeleteChatResponse {
  success: boolean;
}

interface DeleteChatError {
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

class DeleteChatResponse(BaseModel):
    success: bool

class ErrorData(BaseModel):
    message: str

class DeleteChatError(BaseModel):
    statusCode: int
    statusMessage: str
    data: ErrorData
```

## Code Examples

### Python Example (using httpx)

```python
from pydantic import BaseModel
import httpx

class DeleteChatResponse(BaseModel):
    success: bool

async def delete_chat(
    user_id: str,
    chat_id: int,
    session_cookie: str
) -> bool:
    async with httpx.AsyncClient() as client:
        response = await client.delete(
            f"https://neptun-webui.vercel.app/api/users/{user_id}/chats/{chat_id}",
            cookies={"neptun-session": session_cookie}
        )
        response.raise_for_status()
        return response.json()
```

### cURL Example

```bash
curl -X DELETE \
  -H "Cookie: neptun-session=your-session-cookie" \
  "https://neptun-webui.vercel.app/api/users/your-user-id/chats/123"
```

### TypeScript/JavaScript Example (using fetch)

```typescript
async function deleteChat(
  userId: string,
  chatId: number
): Promise<boolean> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}/chats/${chatId}`,
    {
      method: 'DELETE',
      credentials: 'include', // Important for cookie handling
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}
```

### Response Status Codes

| Status Code | Description                                        |
|-------------|----------------------------------------------------|
| 200         | Chat successfully deleted                          |
| 401         | Unauthorized (invalid or missing session)          |
| 404         | Chat or user not found                            |
| 500         | Server error during deletion                      |

## Notes

- The session cookie is required for authentication
- The chat must belong to the specified user
- This operation cannot be undone
- All associated chat messages will also be deleted
