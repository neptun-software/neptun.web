# Sign-Up Endpoint

## Overview

This endpoint allows new users to create an account. It validates the input, checks for existing users, creates a new user, and initiates a session.

## Request Details

### HTTP Method

POST

### Route

`/api/auth/sign-up`

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

#### TypeScript Interface

```typescript
interface SignUpRequest {
  email: string
  password: string
}

interface SignUpResponse {
  user: {
    id: string
    primary_email: string
  }
  loggedInAt: string
}
```

#### Python Model

```python
from pydantic import BaseModel, EmailStr
from datetime import datetime

class SignUpRequest(BaseModel):
    email: EmailStr
    password: str

class UserInfo(BaseModel):
    id: str
    primary_email: EmailStr

class SignUpResponse(BaseModel):
    user: UserInfo
    loggedInAt: datetime
```

### cURL Example

```bash
curl -X POST https://neptun-webui.vercel.app/api/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "yourpassword"
  }'
```

### TypeScript/JavaScript Example (using fetch)

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

### Python Example (using httpx)

```python
from pydantic import BaseModel, EmailStr
import httpx
from datetime import datetime

class SignUpRequest(BaseModel):
    email: EmailStr
    password: str

class UserInfo(BaseModel):
    id: str
    primary_email: EmailStr

class SignUpResponse(BaseModel):
    user: UserInfo
    loggedInAt: datetime

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

### Response Status Codes

| Status Code | Description                                     |
| ----------- | ----------------------------------------------- |
| 200         | User created and session initiated successfully |
| 400         | Invalid request body                            |
| 409         | User already exists                             |
| 500         | Internal server error during user creation      |
