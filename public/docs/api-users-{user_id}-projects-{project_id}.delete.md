# Project Deletion Endpoint

## Overview

This endpoint allows users to delete a specific project and all its associated resources.

## Request Details

### HTTP Method

DELETE

### Route

`/api/users/{user_id}/projects/{project_id}`

### Route Parameters

| Parameter  | Type    | Required | Description                      |
| ---------- | ------- | -------- | -------------------------------- |
| user_id    | integer | Yes      | The ID of the authenticated user |
| project_id | integer | Yes      | The ID of the project            |

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

| Status Code | Description                               |
| ----------- | ----------------------------------------- |
| 200         | Successfully deleted project              |
| 401         | Unauthorized (invalid or missing session) |
| 403         | Forbidden (user_id mismatch)              |
| 404         | Project not found                         |
| 500         | Server error                              |

### Success Response (200 OK)

Returns `true` on successful deletion.

```json
true
```

### Error Response (404 Not Found)

```json
{
  "statusCode": 404,
  "message": "Project not found"
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
curl -X DELETE "https://neptun-webui.vercel.app/api/users/1/projects/1" \
  -H "Accept: application/json" \
  -H "Cookie: neptun-session=your-session-cookie"
```

### Python Example

```python
import httpx

async def delete_project(
    user_id: int,
    project_id: int,
    session_cookie: str
) -> bool:
    url = f"https://neptun-webui.vercel.app/api/users/{user_id}/projects/{project_id}"

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
async function deleteProject(
  userId: number,
  projectId: number,
  sessionCookie: string
): Promise<boolean> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}/projects/${projectId}`,
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

- The session cookie is required for authentication
- The project must belong to the specified user
- This operation cannot be undone
- All associated resources will be deleted, including:
  - Project files
  - Project imports
  - Project templates
  - Project chat conversations
  - Project GitHub installations
