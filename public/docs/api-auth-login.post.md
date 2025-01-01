# Login Endpoint

## Overview

This endpoint authenticates a user with their email and password.

## Request Details

### HTTP Method

POST

### Route

`/api/auth/login`

### Route Parameters

No route parameters required.

### Headers

| Header       | Value            | Required | Description                 |
| ------------ | ---------------- | -------- | --------------------------- |
| Content-Type | application/json | Yes      | Indicates JSON request body |

### Query Parameters

No query parameters required.

### Request Body

| Field    | Type   | Required | Description                   | Constraints        |
| -------- | ------ | -------- | ----------------------------- | ------------------ |
| email    | string | Yes      | Email address of the user     | Valid email format |
| password | string | Yes      | Password for the user account | Non-empty string   |

## Response Format

### Response Status Codes

| Status Code | Description                        |
| ----------- | ---------------------------------- |
| 200         | Successfully authenticated         |
| 400         | Invalid request body               |
| 401         | Invalid credentials                |
| 500         | Server error during authentication |

### Success Response (200 OK)

#### Headers

| Header     | Description                                               |
| ---------- | --------------------------------------------------------- |
| Set-Cookie | Sets the neptun-session cookie for session authentication |

#### Body

```json
{
  "user": {
    "id": 123,
    "primary_email": "user@example.com"
  }
}
```

### Error Response (401 Unauthorized)

```json
{
  "statusCode": 401,
  "statusMessage": "Unauthorized",
  "data": {
    "message": "Invalid credentials"
  }
}
```

### TypeScript Interface

```typescript
interface LoginRequest {
  email: string // Valid email format required
  password: string // Non-empty string required
}

interface User {
  id: number
  primary_email: string
}

interface LoginResponse {
  user: User
}

interface LoginError {
  statusCode: number
  statusMessage: string
  data: {
    message: string
  }
}
```

### Python Model

```python
from pydantic import BaseModel, EmailStr

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserInfo(BaseModel):
    id: int
    primary_email: EmailStr

class LoginResponse(BaseModel):
    user: UserInfo
```

## Code Examples

### cURL Example

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "your-password"}' \
  "https://neptun-webui.vercel.app/api/auth/login"
```

### Python Example

```python
async def login(email: str, password: str) -> LoginResponse:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://neptun-webui.vercel.app/api/auth/login",
            json={"email": email, "password": password}
        )
        response.raise_for_status()
        return LoginResponse(**response.json())
```

### TypeScript/JavaScript Example

```typescript
async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const response = await fetch(
    'https://neptun-webui.vercel.app/api/auth/login',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    }
  )

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return await response.json() as LoginResponse
}
```

## Notes

- A successful login will set a `neptun-session` cookie for authentication
- The session cookie is HttpOnly and Secure
- The session cookie is required for subsequent authenticated requests
- Password requirements are enforced on the server side
