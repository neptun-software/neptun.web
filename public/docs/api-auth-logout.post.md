# Logout Endpoint

## Overview

This endpoint handles user logout by clearing the active session cookie.

## Request Details

### HTTP Method

POST

### Route

`/api/auth/logout`

### Route Parameters

No route parameters required.

### Headers

| Header | Value          | Required | Description                   |
| ------ | -------------- | -------- | ----------------------------- |
| Cookie | neptun-session | Yes      | Session authentication cookie |

### Query Parameters

No query parameters required.

### Request Body

No request body required.

## Response Format

### Response Status Codes

| Status Code | Description                                   |
| ----------- | --------------------------------------------- |
| 200         | Request processed successfully                |
| 401         | No valid session cookie provided              |
| 500         | Server error occurred during session clearing |

### Success Response (200 OK)

#### Headers

| Header     | Description                                               |
| ---------- | --------------------------------------------------------- |
| Set-Cookie | Clears the neptun-session cookie by setting it to expired |

#### When Active Session Was Cleared

```json
true
```

#### When No Active Session Existed

```json
false
```

### Error Response (401 Unauthorized)

```json
{
  "statusCode": 401,
  "statusMessage": "Unauthorized",
  "data": {
    "message": "No valid session"
  }
}
```

### TypeScript Interface

```typescript
interface LogoutResponse {
  success: boolean
}

interface LogoutError {
  statusCode: number
  statusMessage: string
  data: {
    message: string
  }
}
```

### Python Model

```python
from pydantic import BaseModel

class LogoutResponse(BaseModel):
    success: bool
```

## Code Examples

### cURL Example

```bash
curl -X POST \
  -H "Cookie: neptun-session=your-session-cookie" \
  "https://neptun-webui.vercel.app/api/auth/logout"
```

### Python Example

```python
from pydantic import BaseModel
import httpx

class LogoutResponse(BaseModel):
    success: bool

async def logout() -> bool:
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "https://neptun-webui.vercel.app/api/auth/logout",
                cookies={"neptun-session": "your-session-cookie"},
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError:
            return False
```

### TypeScript/JavaScript Example

```typescript
async function logout(): Promise<boolean> {
  try {
    const response = await fetch(
      'https://neptun-webui.vercel.app/api/auth/logout',
      {
        method: 'POST',
        credentials: 'include', // Important for cookie handling
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Logout failed:', error)
    return false
  }
}
```

## Notes

- The endpoint returns `true` if an active session was successfully cleared
- The endpoint returns `false` if there was no active session to clear
- The session cookie will be invalidated upon successful logout
- No additional authentication headers are required as the session cookie is used for authentication
