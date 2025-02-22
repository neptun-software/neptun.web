# Reset Password Endpoint

## Overview

This endpoint allows users to reset their password using a one-time password (OTP).

## Request Details

### HTTP Method

POST

### Route

`/{email}/reset-password`

### Headers

| Header       | Value            | Required | Description                 |
| ------------ | ---------------- | -------- | --------------------------- |
| Content-Type | application/json | Yes      | Indicates JSON request body |

### Route Parameters

| Parameter | Type   | Required | Description                   |
| --------- | ------ | -------- | ----------------------------- |
| email     | string | Yes      | The email address of the user |

### Query Parameters

No query parameters required.

### Request Body

| Field        | Type   | Required | Description                          |
| ------------ | ------ | -------- | ------------------------------------ |
| otp          | string | Yes      | One-time password received via email |
| new_password | string | Yes      | New password for the account         |

## Response Format

### Response Status Codes

| Status Code | Description                            |
| ----------- | -------------------------------------- |
| 200         | Password successfully reset            |
| 400         | Invalid request body or missing fields |
| 404         | Email not found or OTP expired         |
| 429         | Too many reset attempts                |
| 500         | Server error during password reset     |

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Successfully validated OTP and reset password."
}
```

### Error Response

#### Invalid or Expired OTP

```json
{
  "success": false,
  "message": "Invalid or expired OTP."
}
```

#### No OTP Found

```json
{
  "success": false,
  "message": "No OTP found. Please request a new OTP."
}
```

#### Password Reset Failed

```json
{
  "success": false,
  "message": "Something went wrong. Could not reset password. Please try again."
}
```

### TypeScript Interface

```typescript
interface ResetPasswordRequest {
  otp: string
  new_password: string
}

interface ResetPasswordResponse {
  success: boolean
  message: string
}
```

### Python Model

```python
from pydantic import BaseModel

class ResetPasswordRequest(BaseModel):
    otp: str
    new_password: str

class ResetPasswordResponse(BaseModel):
    success: bool
    message: str
```

## Code Examples

### Python Example

```python
import httpx
from pydantic import BaseModel
from typing import Optional

class ResetPasswordRequest(BaseModel):
    otp: str
    new_password: str

class ResetPasswordResponse(BaseModel):
    success: bool
    message: str

async def reset_password(email: str, otp: str, new_password: str) -> ResetPasswordResponse:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"https://neptun-webui.vercel.app/{email}/reset-password",
            json={"otp": otp, "new_password": new_password}
        )
        response.raise_for_status()
        return ResetPasswordResponse(**response.json())
```

### cURL Example

```bash
curl -X POST https://neptun-webui.vercel.app/user@example.com/reset-password \
  -H "Content-Type: application/json" \
  -d '{"otp": "123456", "new_password": "newSecurePassword123"}'
```

### TypeScript/JavaScript Example

```typescript
async function resetPassword(
  email: string,
  otp: string,
  newPassword: string
): Promise<ResetPasswordResponse> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/${email}/reset-password`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        otp,
        new_password: newPassword,
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return await response.json() as ResetPasswordResponse
}
```

## Notes

- OTP must be valid and not expired
- New password must meet security requirements (min 8 chars, etc.)
- Limited number of reset attempts per email address
- Password reset invalidates all existing sessions
- Email address must be URL encoded in the request path
