# Delete User Endpoint

## Overview

This endpoint permanently deletes a user account and clears their session.

## Request Details

### HTTP Method

DELETE

### Route

`/api/users/{user_id}`

### Route Parameters

| Parameter | Type   | Required | Description                   |
| --------- | ------ | -------- | ----------------------------- |
| user_id   | string | Yes      | Unique identifier of the user |

### Headers

| Header | Value          | Required | Description                   |
| ------ | -------------- | -------- | ----------------------------- |
| Cookie | neptun-session | Yes      | Session authentication cookie |

### Query Parameters

No query parameters required.

### Request Body

No request body required.

## Response Format

### Success Response (200 OK)

Returns a boolean indicating whether the deletion was successful.

```json
true
```

### Error Responses

#### Invalid User ID (400 Bad Request)

```json
{
  "statusCode": 400,
  "statusMessage": "Bad Request",
  "data": {
    "message": "Invalid user ID format"
  }
}
```

#### User Not Found (404 Not Found)

```json
{
  "statusCode": 404,
  "statusMessage": "Not Found",
  "data": {
    "message": "User not found"
  }
}
```

#### TypeScript Interface

```typescript
interface DeleteUserResponse {
  success: boolean
}

interface DeleteUserError {
  statusCode: number
  statusMessage: string
  data: {
    message: string
  }
}
```

#### Python Model

```python
from pydantic import BaseModel

class DeleteUserResponse(BaseModel):
    success: bool

class ErrorData(BaseModel):
    message: str

class DeleteUserError(BaseModel):
    statusCode: int
    statusMessage: str
    data: ErrorData
```

## Code Examples

### Python Example (using httpx)

```python
from pydantic import BaseModel
import httpx

class DeleteUserResponse(BaseModel):
    success: bool

async def delete_user(user_id: str, session_cookie: str) -> bool:
    async with httpx.AsyncClient() as client:
        response = await client.delete(
            f"https://neptun-webui.vercel.app/api/users/{user_id}",
            cookies={"neptun-session": session_cookie}
        )
        response.raise_for_status()
        return response.json()
```

### cURL Example

```bash
curl -X DELETE \
  -H "Cookie: neptun-session=your-session-cookie" \
  "https://neptun-webui.vercel.app/api/users/your-user-id"
```

### TypeScript/JavaScript Example (using fetch)

```typescript
async function deleteUser(userId: string): Promise<boolean> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}`,
    {
      method: 'DELETE',
      credentials: 'include', // Important for cookie handling
    }
  )

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return await response.json()
}
```

### Response Status Codes

| Status Code | Description                               |
| ----------- | ----------------------------------------- |
| 200         | User successfully deleted                 |
| 400         | Invalid user ID format                    |
| 401         | Unauthorized (invalid or missing session) |
| 404         | User not found                            |
| 500         | Server error during deletion              |

## Notes

- The session cookie is required for authentication
- Upon successful deletion, the user's session is automatically cleared
- This action is permanent and cannot be undone
- All associated user data will be deleted from the system
