# Shared Chat Messages Endpoint

## Overview

This endpoint retrieves messages from a shared chat conversation. It supports password protection and whitelist-based access control.

## Request Details

### HTTP Method

GET

### Route

`/api/shared/chats/{uuid}`

### Route Parameters

| Parameter | Type   | Required | Description                                    |
|-----------|--------|----------|------------------------------------------------|
| uuid      | string | Yes      | Unique identifier of the shared chat          |

### Headers

| Header         | Value          | Required | Description                                           |
|----------------|----------------|----------|-------------------------------------------------------|
| Authorization  | Basic {token}  | No*      | Base64 encoded username:password for protected chats  |

*Required only for password-protected chats

### Query Parameters

No query parameters required.

### Request Body

No request body required.

## Response Format

### Success Response (200 OK)

```typescript
interface SharedChatResponse {
  chatMessages: ChatMessage[];
  shareInfo: {
    shareExists: boolean;
    shareIsPrivate: boolean;
    shareHasPassword: boolean;
    shareHasWhitelist: boolean;
  };
}
```

#### Example Response

```json
{
  "chatMessages": [
    {
      "id": "msg123",
      "content": "Hello world",
      "role": "user",
      "timestamp": "2024-03-20T10:30:00Z"
    }
  ],
  "shareInfo": {
    "shareExists": true,
    "shareIsPrivate": true,
    "shareHasPassword": true,
    "shareHasWhitelist": false
  }
}
```

### Error Responses

#### Not Found (404)

```json
{
  "statusCode": 404,
  "statusMessage": "Not Found (share not found)",
  "message": "The share does not exist.",
  "data": {
    "shareInfo": {
      "shareExists": false,
      "shareIsPrivate": false,
      "shareHasPassword": false,
      "shareHasWhitelist": false
    }
  }
}
```

#### Unauthorized (401)

```json
{
  "statusCode": 401,
  "statusMessage": "Unauthorized (incorrect credentials)",
  "message": "You are not authorized to view this chat.",
  "data": {
    "shareInfo": {
      "shareExists": true,
      "shareIsPrivate": true,
      "shareHasPassword": true,
      "shareHasWhitelist": false
    }
  }
}
```

## Code Examples

### Python Example (using httpx)

```python
from pydantic import BaseModel
import httpx
import base64
from typing import List, Optional
from datetime import datetime

class ChatMessage(BaseModel):
    id: str
    content: str
    role: str
    timestamp: datetime

class ShareInfo(BaseModel):
    shareExists: bool
    shareIsPrivate: bool
    shareHasPassword: bool
    shareHasWhitelist: bool

class SharedChatResponse(BaseModel):
    chatMessages: List[ChatMessage]
    shareInfo: ShareInfo

async def get_shared_chat(
    uuid: str,
    password: Optional[str] = None
) -> SharedChatResponse:
    async with httpx.AsyncClient() as client:
        headers = {}
        if password:
            auth = base64.b64encode(f":{password}".encode()).decode()
            headers["Authorization"] = f"Basic {auth}"
            
        response = await client.get(
            f"https://neptun-webui.vercel.app/api/shared/chats/{uuid}",
            headers=headers
        )
        response.raise_for_status()
        return SharedChatResponse(**response.json())
```

### cURL Example

```bash
# Without password
curl -X GET "https://neptun-webui.vercel.app/api/shared/chats/your-uuid-here"

# With password
curl -X GET "https://neptun-webui.vercel.app/api/shared/chats/your-uuid-here" \
  -H "Authorization: Basic $(echo -n ':your-password' | base64)"
```

### TypeScript/JavaScript Example (using fetch)

```typescript
interface ChatMessage {
  id: string;
  content: string;
  role: string;
  timestamp: string;
}

interface ShareInfo {
  shareExists: boolean;
  shareIsPrivate: boolean;
  shareHasPassword: boolean;
  shareHasWhitelist: boolean;
}

interface SharedChatResponse {
  chatMessages: ChatMessage[];
  shareInfo: ShareInfo;
}

async function getSharedChat(
  uuid: string,
  password?: string
): Promise<SharedChatResponse> {
  const headers: HeadersInit = {};
  if (password) {
    const auth = btoa(`:${password}`);
    headers.Authorization = `Basic ${auth}`;
  }

  const response = await fetch(
    `https://neptun-webui.vercel.app/api/shared/chats/${uuid}`,
    { headers }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json() as SharedChatResponse;
}
```

### Response Status Codes

| Status Code | Description                                        |
|-------------|----------------------------------------------------|
| 200         | Successfully retrieved chat messages               |
| 401         | Unauthorized (missing or invalid password)         |
| 403         | Forbidden (not on whitelist)                      |
| 404         | Share not found                                   |
| 500         | Server error                                      |
