# Session Check Endpoint

## Overview

This endpoint checks if the current session is valid.

## Request Details

### HTTP Method

HEAD

### Route

`/api/auth/check`

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

| Status Code | Description                               |
| ----------- | ----------------------------------------- |
| 200         | Session is valid                          |
| 401         | Unauthorized (invalid or missing session) |

### Success Response (200 OK)

No response body (HEAD request).

### Error Response (401 Unauthorized)

No response body (HEAD request).

### TypeScript Interface

No interfaces required (HEAD request).

### Python Model

No models required (HEAD request).

## Code Examples

### cURL Example

```bash
curl -I \
  -H "Cookie: neptun-session=your-session-cookie" \
  "https://neptun-webui.vercel.app/api/auth/check"
```

### Python Example

```python
async def check_session(session_cookie: str) -> bool:
    async with httpx.AsyncClient() as client:
        response = await client.head(
            "https://neptun-webui.vercel.app/api/auth/check",
            cookies={"neptun-session": session_cookie}
        )
        return response.status_code == 200
```

### TypeScript/JavaScript Example

```typescript
async function checkSession(): Promise<boolean> {
  const response = await fetch(
    'https://neptun-webui.vercel.app/api/auth/check',
    {
      method: 'HEAD',
      credentials: 'include', // Important for cookie handling
    }
  )
  return response.ok
}
```

## Notes

- This endpoint is useful for checking session validity without fetching data
- No response body is returned (HEAD request)
- The session cookie is required for authentication
