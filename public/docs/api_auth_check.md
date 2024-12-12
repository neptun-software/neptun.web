# Authentication Check Endpoint

## Overview

This endpoint verifies if a user session is valid by checking the authentication cookie. It uses a HEAD request and returns no response body.

## Request Details

### HTTP Method

HEAD

### Route

`/api/auth/check`

### Headers

| Header         | Value            | Required | Description                          |
|----------------|------------------|----------|--------------------------------------|
| Cookie         | auth_session=xyz | Yes      | Authentication session cookie        |

### Query Parameters

No query parameters required.

### Request Body

No request body required.

### Route Parameters

No route parameters required.

## Response Format

### Success Response (200 OK)

The endpoint returns no response body, only a status code indicating a valid session.

#### Response Headers

| Header          | Value | Description                    |
|-----------------|-------|--------------------------------|
| Content-Length  | 0     | Indicates empty response body  |

### Error Responses

#### Unauthorized (401)

Returns status code 401 when the session is invalid or missing.

No response body is returned.

## Code Examples

### Python Example (using httpx)

```python
from pydantic import BaseModel
import httpx

async def check_auth_session(session_cookie: str) -> bool:
    async with httpx.AsyncClient() as client:
        try:
            response = await client.head(
                "https://neptun-webui.vercel.app/api/auth/check",
                cookies={"auth_session": session_cookie}
            )
            return response.status_code == 200
        except httpx.HTTPError:
            return False
```

### cURL Example

```bash
curl -I -X HEAD \
  -b "auth_session=your-session-cookie-here" \
  https://neptun-webui.vercel.app/api/auth/check
```

### TypeScript/JavaScript Example (using fetch)

```typescript
async function checkAuthSession(): Promise<boolean> {
  try {
    const response = await fetch(
      'https://neptun-webui.vercel.app/api/auth/check',
      {
        method: 'HEAD',
        credentials: 'include' // Includes cookies in the request
      }
    );
    return response.ok;
  } catch (error) {
    return false;
  }
}
```

### Response Status Codes

| Status Code | Description                                        |
|-------------|----------------------------------------------------|
| 200         | Session is valid                                   |
| 401         | Session is invalid or missing                      |
