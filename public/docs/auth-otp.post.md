# One-Time Password (OTP) Endpoint

## Overview

This endpoint handles OTP creation and validation for password reset functionality.

## Request Details

### HTTP Method

POST

### Route

`/auth/otp`

### Headers

| Header       | Value            | Required | Description                 |
| ------------ | ---------------- | -------- | --------------------------- |
| Content-Type | application/json | Yes      | Indicates JSON request body |

### Query Parameters

No query parameters required.

### Request Body

The request body varies based on the `action` field:

#### For OTP Creation

| Field  | Type   | Required | Description                      |
| ------ | ------ | -------- | -------------------------------- |
| action | string | Yes      | Must be "create"                 |
| email  | string | Yes      | Email address to receive the OTP |

#### For OTP Validation

| Field        | Type   | Required | Description                          |
| ------------ | ------ | -------- | ------------------------------------ |
| action       | string | Yes      | Must be "validate"                   |
| email        | string | Yes      | Email address associated with OTP    |
| otp          | string | Yes      | 5-digit OTP received via email       |
| new_password | string | Yes      | New password to set after validation |

## Response Format

### Response Status Codes

| Status Code | Description                            |
| ----------- | -------------------------------------- |
| 200         | OTP successfully created or validated  |
| 400         | Invalid request body or missing fields |
| 404         | Email not found                        |
| 429         | Too many OTP requests                  |
| 500         | Server error during OTP operation      |

### Success Response (200 OK)

#### OTP Creation Success

```json
{
  "success": true,
  "message": "Successfully sent OTP."
}
```

#### OTP Validation Success

```json
{
  "success": true,
  "message": "Successfully validated OTP and reset password."
}
```

### Error Response

#### Invalid Action

```json
{
  "success": false,
  "message": "Invalid action."
}
```

#### OTP Sending Failed

```json
{
  "success": false,
  "message": "Something went wrong. Could not send OTP. Please try again."
}
```

#### OTP Validation Failed

```json
{
  "success": false,
  "message": "Something went wrong. Could not validate OTP. Please try again."
}
```

### TypeScript Interface

```typescript
interface OTPCreateRequest {
  action: 'create'
  email: string
}

interface OTPValidateRequest {
  action: 'validate'
  email: string
  otp: string
  new_password: string
}

interface OTPResponse {
  success: boolean
  message: string
}
```

### Python Model

```python
from pydantic import BaseModel
from typing import Literal

class OTPCreateRequest(BaseModel):
    action: Literal['create']
    email: str

class OTPValidateRequest(BaseModel):
    action: Literal['validate']
    email: str
    otp: str
    new_password: str

class OTPResponse(BaseModel):
    success: bool
    message: str
```

## Code Examples

### Python Example

```python
import httpx
from pydantic import BaseModel
from typing import Literal

class OTPCreateRequest(BaseModel):
    action: Literal['create']
    email: str

class OTPValidateRequest(BaseModel):
    action: Literal['validate']
    email: str
    otp: str
    new_password: str

class OTPResponse(BaseModel):
    success: bool
    message: str

async def request_otp(email: str) -> OTPResponse:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://neptun-webui.vercel.app/auth/otp",
            json={"action": "create", "email": email}
        )
        response.raise_for_status()
        return OTPResponse(**response.json())

async def validate_otp(email: str, otp: str, new_password: str) -> OTPResponse:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://neptun-webui.vercel.app/auth/otp",
            json={
                "action": "validate",
                "email": email,
                "otp": otp,
                "new_password": new_password
            }
        )
        response.raise_for_status()
        return OTPResponse(**response.json())
```

### cURL Examples

#### Request OTP

```bash
curl -X POST https://neptun-webui.vercel.app/auth/otp \
  -H "Content-Type: application/json" \
  -d '{"action": "create", "email": "user@example.com"}'
```

#### Validate OTP

```bash
curl -X POST https://neptun-webui.vercel.app/auth/otp \
  -H "Content-Type: application/json" \
  -d '{"action": "validate", "email": "user@example.com", "otp": "12345", "new_password": "newSecurePassword123"}'
```

### TypeScript/JavaScript Example

```typescript
async function requestOTP(email: string): Promise<OTPResponse> {
  const response = await fetch('https://neptun-webui.vercel.app/auth/otp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'create',
      email,
    }),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return await response.json() as OTPResponse
}

async function validateOTP(
  email: string,
  otp: string,
  newPassword: string
): Promise<OTPResponse> {
  const response = await fetch('https://neptun-webui.vercel.app/auth/otp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'validate',
      email,
      otp,
      new_password: newPassword,
    }),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return await response.json() as OTPResponse
}
```

## Notes

- OTP is valid for 10 minutes after creation
- Maximum 3 OTP requests per email address per hour
- OTP must be exactly 5 digits
- New password must meet security requirements (min 8 chars, etc.)
- Failed validation attempts are limited to prevent brute force attacks
