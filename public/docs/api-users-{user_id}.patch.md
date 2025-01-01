# Update User Endpoint

## Overview

This endpoint updates a user's email and/or password and refreshes their session.

## Request Details

### HTTP Method

PATCH

### Route

`/api/users/{user_id}`

### Route Parameters

| Parameter | Type    | Required | Description                   |
| --------- | ------- | -------- | ----------------------------- |
| user_id   | integer | Yes      | Unique identifier of the user |

### Headers

| Header       | Value            | Required | Description                   |
| ------------ | ---------------- | -------- | ----------------------------- |
| Content-Type | application/json | Yes      | Indicates JSON request body   |
| Cookie       | neptun-session   | Yes      | Session authentication cookie |

### Query Parameters

No query parameters required.

### Request Body

At least one of the following fields must be provided:

| Field    | Type   | Required | Description                    | Constraints        |
| -------- | ------ | -------- | ------------------------------ | ------------------ |
| email    | string | No       | New email address for the user | Valid email format |
| password | string | No       | New password for the user      | Non-empty string   |

## Response Format

### Response Status Codes

| Status Code | Description                                     |
| ----------- | ----------------------------------------------- |
| 200         | User successfully updated                       |
| 400         | Invalid request body or missing required fields |
| 401         | Unauthorized (invalid or missing session)       |
| 404         | User not found                                  |
| 500         | Server error during update                      |

### Success Response (200 OK)

```json
{
  "user": {
    "id": 123,
    "primary_email": "newemail@example.com"
  }
}
```

### Error Response (400 Bad Request)

```json
{
  "statusCode": 400,
  "statusMessage": "Bad Request.",
  "message": "Invalid body(?email, ?password). At least one of email or password is required.",
  "data": {
    "issues": [
      {
        "code": "invalid_string",
        "validation": "email",
        "message": "Invalid email"
      }
    ]
  }
}
```

### TypeScript Interface

```typescript
interface UpdateUserRequest {
  email?: string
  password?: string
}

interface UpdateUserResponse {
  user: {
    id: number
    primary_email: string
  }
}

interface UpdateUserError {
  statusCode: number
  statusMessage: string
  message: string
  data?: {
    issues: Array<{
      code: string
      validation: string
      message: string
    }>
  }
}
```

### Python Model

```python
from pydantic import BaseModel, EmailStr
from typing import Optional, List

class ValidationIssue(BaseModel):
    code: str
    validation: str
    message: str

class UpdateUserRequest(BaseModel):
    email: Optional[EmailStr]
    password: Optional[str]

class User(BaseModel):
    id: int
    primary_email: str

class UpdateUserResponse(BaseModel):
    user: User

class UpdateUserError(BaseModel):
    statusCode: int
    statusMessage: str
    message: str
    data: Optional[dict[str, List[ValidationIssue]]]
```

## Code Examples

### Python Example

```python
import httpx
from typing import Optional

async def update_user(
    user_id: int,
    email: Optional[str] = None,
    password: Optional[str] = None,
    session_cookie: str = None
) -> UpdateUserResponse:
    url = f"https://neptun-webui.vercel.app/api/users/{user_id}"

    data = {}
    if email is not None:
        data["email"] = email
    if password is not None:
        data["password"] = password

    async with httpx.AsyncClient() as client:
        response = await client.patch(
            url,
            json=data,
            headers={
                "Content-Type": "application/json",
                "Cookie": f"neptun-session={session_cookie}"
            }
        )
        response.raise_for_status()
        return UpdateUserResponse(**response.json())
```

### cURL Example

```bash
curl -X PATCH \
  -H "Content-Type: application/json" \
  -H "Cookie: neptun-session=your-session-cookie" \
  -d '{"email":"newemail@example.com"}' \
  "https://neptun-webui.vercel.app/api/users/your-user-id"
```

### TypeScript/JavaScript Example

```typescript
async function updateUser(
  userId: number,
  data: UpdateUserRequest,
  sessionCookie: string
): Promise<UpdateUserResponse> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `neptun-session=${sessionCookie}`,
      },
      body: JSON.stringify(data),
    }
  )

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return await response.json()
}
```

## Notes

- At least one of email or password must be provided in the request body
- The session is automatically updated if the email is changed
- The session cookie is required for authentication
- All fields in the request body are optional, but at least one must be present
