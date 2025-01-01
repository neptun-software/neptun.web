# Sign-Up Endpoint

## Overview

This endpoint allows new users to create an account. It validates the input, checks for existing users, creates a new user, and initiates a session.

## Request Details

### HTTP Method

POST

### Route

`/api/auth/sign-up`

### Route Parameters

No route parameters required.

### Headers

| Header       | Value            | Required | Description                 |
| ------------ | ---------------- | -------- | --------------------------- |
| Content-Type | application/json | Yes      | Indicates JSON request body |

### Query Parameters

No query parameters required.

### Request Body

| Field    | Type   | Required | Description          | Constraints                  |
| -------- | ------ | -------- | -------------------- | ---------------------------- |
| email    | string | Yes      | User's email address | Must be a valid email format |
| password | string | Yes      | User's password      | Non-empty string             |

## Response Format

### Response Status Codes

| Status Code | Description                                     |
| ----------- | ----------------------------------------------- |
| 200         | User created and session initiated successfully |
| 400         | Invalid request body                            |
| 409         | User already exists                             |
| 500         | Internal server error during user creation      |

### Success Response (200 OK)

A successful sign-up will:

1. Return a JSON response with user information
2. Set a response header `Set-Cookie` with `neptun-session` cookie for authentication

#### Response Headers

| Header     | Value          | Description                            |
| ---------- | -------------- | -------------------------------------- |
| Set-Cookie | neptun-session | Session cookie used for authentication |

#### Response Body

```json
{
  "user": {
    "id": 123,
    "primary_email": "user@example.com"
  },
  "loggedInAt": "2024-03-20T10:30:45.123Z"
}
```

### Error Response (400 Bad Request)

```json
{
  "statusCode": 400,
  "statusMessage": "Bad Request",
  "data": {
    "message": "Invalid email format"
  }
}
```

### Error Response (409 Conflict)

```json
{
  "statusCode": 409,
  "statusMessage": "Conflict",
  "data": {
    "message": "User already exists"
  }
}
```

### TypeScript Interface

```typescript
interface SignUpRequest {
  email: string // Valid email format required
  password: string // Non-empty string with specific requirements
}

interface User {
  id: number
  primary_email: string
}

interface SignUpResponse {
  user: User
  loggedInAt: string // ISO 8601 date string
}

interface SignUpError {
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
from datetime import datetime

class SignUpRequest(BaseModel):
    email: EmailStr
    password: str

class UserInfo(BaseModel):
    id: int
    primary_email: EmailStr

class SignUpResponse(BaseModel):
    user: UserInfo
    loggedInAt: datetime

class SignUpError(BaseModel):
    statusCode: int
    statusMessage: str
    data: dict[str, str]
```

## Code Examples

### cURL Example

```bash
curl -X POST https://neptun-webui.vercel.app/api/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "yourpassword"
  }'
```

### Python Example

```python
from pydantic import BaseModel, EmailStr
import httpx
from datetime import datetime

async def sign_up(email: str, password: str) -> SignUpResponse:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://neptun-webui.vercel.app/api/auth/sign-up",
            json={
                "email": email,
                "password": password
            }
        )
        response.raise_for_status()
        return SignUpResponse(**response.json())
```

### TypeScript/JavaScript Example

```typescript
async function signUp(email: string, password: string): Promise<SignUpResponse> {
  const response = await fetch(
    'https://neptun-webui.vercel.app/api/auth/sign-up',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
      credentials: 'include', // Important for cookie handling
    }
  )

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return await response.json() as SignUpResponse
}
```

## Notes

- The endpoint validates email format and password requirements
- A successful sign-up automatically creates a session
- The session cookie is HttpOnly and Secure
- The session cookie is required for subsequent authenticated requests
- Email addresses must be unique across all users
