# Delete Project Resource Endpoint

## Overview

This endpoint allows users to delete a specific resource from a project.

## Request Details

### HTTP Method

DELETE

### Route

`/api/users/{user_id}/projects/{project_id}/resources/{resource_type}/{resource_id}`

### Route Parameters

| Parameter     | Type    | Required | Description                                                                                                 |
| ------------- | ------- | -------- | ----------------------------------------------------------------------------------------------------------- |
| user_id       | integer | Yes      | The ID of the authenticated user                                                                            |
| project_id    | integer | Yes      | The ID of the project                                                                                       |
| resource_type | string  | Yes      | Type of resource (e.g., 'user-files', 'template-collections', 'github-installations', 'chat-conversations') |
| resource_id   | integer | Yes      | The ID of the resource                                                                                      |

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
| 204         | Successfully deleted resource             |
| 400         | Bad request (invalid parameters)          |
| 401         | Unauthorized (invalid or missing session) |
| 403         | Forbidden (user_id mismatch)              |
| 404         | Resource not found                        |
| 500         | Server error                              |

### Success Response (204 No Content)

No response body.

### Error Response (400 Bad Request)

```json
{
  "statusCode": 400,
  "message": "Invalid resource type or ID"
}
```

## Code Examples

### cURL Example

```bash
curl -X DELETE "https://neptun-webui.vercel.app/api/users/1/projects/789/resources/user-files/123" \
  -H "Accept: application/json" \
  -H "Cookie: neptun-session=your-session-cookie"
```

### Python Example

```python
import httpx
from typing import Literal

ResourceType = Literal['user-files', 'template-collections', 'github-installations', 'chat-conversations']

async def delete_project_resource(
    user_id: int,
    project_id: int,
    resource_type: ResourceType,
    resource_id: int,
    session_cookie: str
) -> None:
    url = f"https://neptun-webui.vercel.app/api/users/{user_id}/projects/{project_id}/resources/{resource_type}/{resource_id}"

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
type ResourceType = 'user-files' | 'template-collections' | 'github-installations' | 'chat-conversations'

async function deleteProjectResource(
  userId: number,
  projectId: number,
  resourceType: ResourceType,
  resourceId: number,
  sessionCookie: string
): Promise<void> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}/projects/${projectId}/resources/${resourceType}/${resourceId}`,
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
- The project and resource must belong to the specified user
- The resource_type must be one of the allowed values
- All associated resource data will be permanently deleted
- This action cannot be undone
- All IDs must be valid positive integers
- Resource-specific deletions:
  - For template-collections: all associated templates will be deleted
  - For chat-conversations: all associated messages will be deleted
  - For github-installations: the GitHub installation connection will be removed
  - For user-files: all file content and metadata will be removed
