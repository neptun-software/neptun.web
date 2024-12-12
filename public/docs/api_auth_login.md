# Login Endpoint

## Overview

This endpoint handles user authentication and session management. It validates user credentials and creates or updates a session.

## Request Details

### HTTP Method

POST

### Route

`/api/auth/login`

### Headers

| Header        | Value            | Required | Description                    |
|---------------|------------------|----------|--------------------------------|
| Content-Type  | application/json | Yes      | Indicates JSON request body    |

### Query Parameters

No query parameters required.

### Request Body

| Field    | Type   | Required | Description                          | Constraints                    |
|----------|--------|----------|--------------------------------------|--------------------------------|
| email    | string | Yes      | User's email address                | Must be a valid email format   |
| password | string | Yes      | User's password                     | Non-empty string               |

#### TypeScript Interface

```typescript
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  user: {
    id: string;
    primary_email: string;
  };
  loggedInAt: string;
}
```

#### Python Model

```python
from pydantic import BaseModel, EmailStr
from datetime import datetime

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserInfo(BaseModel):
    id: str
    primary_email: EmailStr

class LoginResponse(BaseModel):
    user: UserInfo
    loggedInAt: datetime
```

## Response Format

### Success Response (200 OK)

```json
{
  "user": {
    "id": "user123",
    "primary_email": "user@example.com"
  },
  "loggedInAt": "2024-03-20T10:30:45.123Z"
}
```

### Error Responses

#### Invalid Credentials (401 Unauthorized)

```json
{
  "statusCode": 401,
  "statusMessage": "Unauthorized"
}
```

#### Invalid Request Body (400 Bad Request)

```json
{
  "statusCode": 400,
  "statusMessage": "Bad Request",
  "data": {
    "issues": [
      {
        "code": "invalid_string",
        "message": "Invalid email format"
      }
    ]
  }
}
```

## Code Examples

### Python Example (using httpx)

```python
from pydantic import BaseModel, EmailStr
import httpx
from datetime import datetime

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserInfo(BaseModel):
    id: str
    primary_email: EmailStr

class LoginResponse(BaseModel):
    user: UserInfo
    loggedInAt: datetime

async def login(email: str, password: str) -> LoginResponse:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://neptun-webui.vercel.app/api/auth/login",
            json={
                "email": email,
                "password": password
            }
        )
        response.raise_for_status()
        return LoginResponse(**response.json())
```

### cURL Example

```bash
curl -X POST https://neptun-webui.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "yourpassword"
  }'
```

### TypeScript/JavaScript Example (using fetch)

```typescript
async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(
    'https://neptun-webui.vercel.app/api/auth/login',
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
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json() as LoginResponse;
}
```

### Response Status Codes

| Status Code | Description                                        |
|-------------|----------------------------------------------------|
| 200         | Login successful                                   |
| 400         | Invalid request body                               |
| 401         | Invalid credentials                                |
