# User Files List Endpoint

## Overview

This endpoint allows users to retrieve all their files.

## Request Details

### HTTP Method

GET

### Route

`/api/users/{user_id}/files`

### Route Parameters

| Parameter | Type    | Required | Description                      |
| --------- | ------- | -------- | -------------------------------- |
| user_id   | integer | Yes      | The ID of the authenticated user |

### Headers

| Header | Value            | Required | Description                   |
| ------ | ---------------- | -------- | ----------------------------- |
| Accept | application/json | Yes      | Specifies the response format |
| Cookie | neptun-session   | Yes      | Session authentication cookie |

### Query Parameters

No query parameters required.

## Response Format

### Response Status Codes

| Status Code | Description                               |
| ----------- | ----------------------------------------- |
| 200         | Successfully retrieved files              |
| 401         | Unauthorized (invalid or missing session) |
| 403         | Forbidden (user_id mismatch)              |
| 500         | Server error                              |

### Success Response (200 OK)

```json
[
  {
    "id": 123,
    "title": "My File",
    "text": "File content",
    "language": "typescript",
    "extension": "ts",
    "created_at": "2024-03-20T10:00:00Z",
    "updated_at": "2024-03-20T10:00:00Z",
    "neptun_user_id": 456
  }
]
```

### Error Response (401 Unauthorized)

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### TypeScript Interface

```typescript
interface UserFile {
  id: number
  title: string
  text: string
  language: string
  extension: string
  created_at: string
  updated_at: string
  neptun_user_id: number
}
```

### Python Model

```python
from pydantic import BaseModel
from datetime import datetime

class UserFile(BaseModel):
    id: int
    title: str
    text: str
    language: str
    extension: str
    created_at: datetime
    updated_at: datetime
    neptun_user_id: int
```

## Code Examples

### cURL Example

```bash
curl -X GET "https://neptun-webui.vercel.app/api/users/1/files" \
  -H "Accept: application/json" \
  -H "Cookie: neptun-session=your-session-cookie"
```

### Python Example

```python
import httpx
from typing import List

async def get_user_files(
    user_id: int,
    session_cookie: str
) -> List[UserFile]:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://neptun-webui.vercel.app/api/users/{user_id}/files",
            cookies={"neptun-session": session_cookie}
        )
        response.raise_for_status()
        return [UserFile(**file) for file in response.json()]
```

### TypeScript/JavaScript Example

```typescript
async function getUserFiles(
  userId: number
): Promise<UserFile[]> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}/files`,
    {
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

- The session cookie is required for authentication
- Returns all files owned by the specified user
- Files are returned with their full content and metadata
- All timestamps are in ISO 8601 format with UTC timezone
