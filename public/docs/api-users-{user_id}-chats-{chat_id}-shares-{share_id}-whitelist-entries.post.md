# Create Share Whitelist Entries Endpoint

## Overview

This endpoint creates whitelist entries for a chat share, allowing specific users access to the shared chat based on their email addresses.

## Request Details

### HTTP Method

POST

### Route

`/api/users/{user_id}/chats/{chat_id}/shares/{share_id}/whitelist-entries`

### Route Parameters

| Parameter | Type    | Required | Description                    |
| --------- | ------- | -------- | ------------------------------ |
| user_id   | integer | Yes      | Unique identifier of the user  |
| chat_id   | integer | Yes      | Unique identifier of the chat  |
| share_id  | integer | Yes      | Unique identifier of the share |

### Headers

| Header       | Value            | Required | Description                   |
| ------------ | ---------------- | -------- | ----------------------------- |
| Content-Type | application/json | Yes      | Indicates JSON request body   |
| Cookie       | neptun-session   | Yes      | Session authentication cookie |

### Query Parameters

No query parameters required.

### Request Body

| Field  | Type     | Required | Description                           |
| ------ | -------- | -------- | ------------------------------------- |
| emails | string[] | Yes      | Array of email addresses to whitelist |

## Response Format

### Response Status Codes

| Status Code | Description                               |
| ----------- | ----------------------------------------- |
| 200         | Whitelist entries successfully created    |
| 400         | Invalid request body                      |
| 401         | Unauthorized (invalid or missing session) |
| 404         | Share, chat, or user not found            |
| 500         | Server error                              |

### Success Response (200 OK)

```json
{
  "shareWhitelistEntries": [
    {
      "id": 1,
      "chat_conversation_share_id": 123,
      "whitelisted_neptun_user_id": "user456",
      "created_at": "2024-03-20T10:00:00Z"
    },
    {
      "id": 2,
      "chat_conversation_share_id": 123,
      "whitelisted_neptun_user_id": "user789",
      "created_at": "2024-03-20T10:00:00Z"
    }
  ]
}
```

### Error Response (400 Bad Request)

```json
{
  "statusCode": 400,
  "statusMessage": "Bad Request. Invalid body.",
  "data": {
    "issues": [
      {
        "code": "invalid_type",
        "message": "Expected array of strings"
      }
    ]
  }
}
```

### TypeScript Interface

```typescript
interface CreateWhitelistRequest {
  emails: string[]
}

interface WhitelistEntry {
  id: number
  chat_conversation_share_id: number
  whitelisted_neptun_user_id: number
  created_at: string
  updated_at: string
}

interface CreateWhitelistResponse {
  shareWhitelistEntries: WhitelistEntry[]
}

interface CreateWhitelistError {
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
from pydantic import BaseModel, EmailStr
from typing import List
from datetime import datetime

class CreateWhitelistRequest(BaseModel):
    emails: List[EmailStr]

class WhitelistEntry(BaseModel):
    id: int
    chat_conversation_share_id: int
    whitelisted_neptun_user_id: int
    created_at: datetime
    updated_at: datetime

class CreateWhitelistResponse(BaseModel):
    shareWhitelistEntries: List[WhitelistEntry]
```

## Code Examples

### cURL Example

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Cookie: neptun-session=your-session-cookie" \
  -d '{
    "emails": ["user1@example.com", "user2@example.com"]
  }' \
  "https://neptun-webui.vercel.app/api/users/your-user-id/chats/123/shares/456/whitelist-entries"
```

### Python Example

```python
async def create_whitelist_entries(
    user_id: int,
    chat_id: int,
    share_id: int,
    emails: List[str],
    session_cookie: str
) -> CreateWhitelistResponse:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"https://neptun-webui.vercel.app/api/users/{user_id}/chats/{chat_id}/shares/{share_id}/whitelist-entries",
            json={"emails": emails},
            cookies={"neptun-session": session_cookie}
        )
        response.raise_for_status()
        return CreateWhitelistResponse(**response.json())
```

### TypeScript/JavaScript Example

```typescript
async function createWhitelistEntries(
  userId: number,
  chatId: number,
  shareId: number,
  emails: string[]
): Promise<CreateWhitelistResponse> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}/chats/${chatId}/shares/${shareId}/whitelist-entries`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ emails }),
      credentials: 'include', // Important for cookie handling
    }
  )

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return await response.json() as CreateWhitelistResponse
}
```

## Notes

- The session cookie is required for authentication
- The requesting user is automatically added to the whitelist
- Non-existent email addresses are silently ignored
- Only registered users' email addresses can be whitelisted
- Multiple entries can be created in a single request
- Duplicate emails are handled gracefully
