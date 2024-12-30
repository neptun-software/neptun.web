# Logout Endpoint

## Overview

This endpoint handles user logout by clearing the active session cookie.

## Request Details

### HTTP Method

POST

### Route

`/api/auth/logout`

### Headers

| Header | Value            | Required | Description                   |
| ------ | ---------------- | -------- | ----------------------------- |
| Cookie | auth_session=xyz | Yes      | Authentication session cookie |

### Query Parameters

No query parameters required.

### Request Body

No request body required.

### Route Parameters

No route parameters required.

## Response Format

### Success Response (200 OK)

#### When Active Session Was Cleared

```json
true
```

#### When No Active Session Existed

```json
false
```

#### TypeScript Interface

```typescript
interface LogoutResponse {
  success: boolean
}
```

#### Python Model

```python
from pydantic import BaseModel

class LogoutResponse(BaseModel):
    success: bool
```

## Code Examples

### Python Example (using httpx)

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
                cookies={"auth_session": "your-session-cookie"},
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError:
            return False
```

### cURL Example

```bash
curl -X POST \
  -b "auth_session=your-session-cookie-here" \
  https://neptun-webui.vercel.app/api/auth/logout
```

### TypeScript/JavaScript Example (using fetch)

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

### Response Status Codes

| Status Code | Description                                   |
| ----------- | --------------------------------------------- |
| 200         | Request processed successfully                |
| 401         | No valid session cookie provided              |
| 500         | Server error occurred during session clearing |

## Notes

- The endpoint returns `true` if an active session was successfully cleared
- The endpoint returns `false` if there was no active session to clear
- The session cookie will be invalidated upon successful logout
- No additional authentication headers are required as the session cookie is used for authentication
