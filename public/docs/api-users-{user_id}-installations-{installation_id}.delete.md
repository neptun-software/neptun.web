# GitHub App Installation Deletion Endpoint

## Overview

This endpoint allows users to delete a specific GitHub app installation associated with their account.

## Request Details

### HTTP Method

DELETE

### Route

`/api/users/{user_id}/installations/{installation_id}`

### Route Parameters

| Parameter       | Type    | Required | Description                           |
| --------------- | ------- | -------- | ------------------------------------- |
| user_id         | integer | Yes      | The ID of the authenticated user      |
| installation_id | integer | Yes      | The ID of the GitHub app installation |

### Headers

| Header | Value            | Required | Description                   |
| ------ | ---------------- | -------- | ----------------------------- |
| Accept | application/json | Yes      | Specifies the response format |
| Cookie | neptun-session   | Yes      | Session authentication cookie |

### Query Parameters

No query parameters required.

### Request Body

No request body required.

## Response Format

### Response Status Codes

| Status Code | Description                                  |
| ----------- | -------------------------------------------- |
| 200         | Successfully deleted GitHub app installation |
| 401         | Unauthorized (invalid or missing session)    |
| 403         | Forbidden (user_id mismatch)                 |
| 404         | Installation not found                       |
| 500         | Server error                                 |

### Success Response (200 OK)

Returns `true` on successful deletion.

```json
true
```

### Error Response (404 Not Found)

```json
{
  "statusCode": 404,
  "message": "Installation not found"
}
```

### TypeScript Interface

```typescript
type ApiResponse = boolean
```

### Python Model

```python
from pydantic import BaseModel

class ApiResponse(BaseModel):
    success: bool
```

## Code Examples

### cURL Example

```bash
curl -X DELETE "https://neptun-webui.vercel.app/api/users/1/installations/1" \
  -H "Accept: application/json" \
  -H "Cookie: neptun-session=your-session-cookie"
```

### Python Example

```python
import httpx

async def delete_github_app_installation(
    user_id: int,
    installation_id: int,
    session_cookie: str
) -> bool:
    url = f"https://neptun-webui.vercel.app/api/users/{user_id}/installations/{installation_id}"

    async with httpx.AsyncClient() as client:
        response = await client.delete(
            url,
            headers={
                "Accept": "application/json",
                "Cookie": f"neptun-session={session_cookie}"
            }
        )
        response.raise_for_status()
        return response.json()
```

### TypeScript/JavaScript Example

```typescript
async function deleteGithubAppInstallation(
  userId: number,
  installationId: number,
  sessionCookie: string
): Promise<boolean> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}/installations/${installationId}`,
    {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        Cookie: `neptun-session=${sessionCookie}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return await response.json()
}
```

## Notes

- The session cookie is required for authentication.
- The installation must belong to the specified user.
- This operation cannot be undone.
