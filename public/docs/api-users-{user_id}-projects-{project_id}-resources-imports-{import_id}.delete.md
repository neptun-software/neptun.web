# Delete Project Import Endpoint

## Overview

This endpoint allows users to delete a specific import resource from a project.

## Request Details

### HTTP Method

DELETE

### Route

`/api/users/{user_id}/projects/{project_id}/resources/imports/{import_id}`

### Route Parameters

| Parameter  | Type    | Required | Description                      |
| ---------- | ------- | -------- | -------------------------------- |
| user_id    | integer | Yes      | The ID of the authenticated user |
| project_id | integer | Yes      | The ID of the project            |
| import_id  | integer | Yes      | The ID of the import to delete   |

### Headers

| Header | Value            | Required | Description                   |
| ------ | ---------------- | -------- | ----------------------------- |
| Accept | application/json | Yes      | Specifies the response format |
| Cookie | neptun-session   | Yes      | Session authentication cookie |

### Query Parameters

No query parameters required.

## Response Format

### Response Status Codes

| Status Code | Description                               |
| ----------- | ----------------------------------------- |
| 204         | Successfully deleted import               |
| 400         | Bad request (invalid parameters)          |
| 401         | Unauthorized (invalid or missing session) |
| 403         | Forbidden (user_id mismatch)              |
| 404         | Import not found                          |
| 500         | Server error                              |

### Success Response (204 No Content)

No response body.

### Error Response (404 Not Found)

```json
{
  "statusCode": 404,
  "message": "Import not found"
}
```

## Code Examples

### cURL Example

```bash
curl -X DELETE "https://neptun-webui.vercel.app/api/users/1/projects/789/resources/imports/123" \
  -H "Accept: application/json" \
  -H "Cookie: neptun-session=your-session-cookie"
```

### Python Example

```python
import httpx

async def delete_project_import(
    user_id: int,
    project_id: int,
    import_id: int,
    session_cookie: str
) -> None:
    url = f"https://neptun-webui.vercel.app/api/users/{user_id}/projects/{project_id}/resources/imports/{import_id}"

    async with httpx.AsyncClient() as client:
        response = await client.delete(
            url,
            headers={
                "Accept": "application/json",
                "Cookie": f"neptun-session={session_cookie}"
            }
        )
        response.raise_for_status()
```

### TypeScript/JavaScript Example

```typescript
async function deleteProjectImport(
  userId: number,
  projectId: number,
  importId: number,
  sessionCookie: string
): Promise<void> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}/projects/${projectId}/resources/imports/${importId}`,
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
}
```

## Notes

- The session cookie is required for authentication
- The project and import must belong to the specified user
- All associated import data will be permanently deleted
- This action cannot be undone
- All IDs must be valid positive integers
- For GitHub imports, the GitHub installation connection will be removed
