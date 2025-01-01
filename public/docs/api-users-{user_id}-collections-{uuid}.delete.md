# User Template Collection Deletion Endpoint

## Overview

This endpoint allows users to delete a specific template collection.

## Request Details

### HTTP Method

DELETE

### Route

`/api/users/{user_id}/collections/{uuid}`

### Route Parameters

| Parameter | Type    | Required | Description                                      |
| --------- | ------- | -------- | ------------------------------------------------ |
| user_id   | integer | Yes      | The ID of the authenticated user                 |
| uuid      | string  | Yes      | The unique identifier of the template collection |

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
| 200         | Successfully deleted collection           |
| 401         | Unauthorized (invalid or missing session) |
| 403         | Forbidden (user_id mismatch)              |
| 404         | Collection not found                      |
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
  "message": "Collection not found"
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
curl -X DELETE "https://neptun-webui.vercel.app/api/users/1/collections/550e8400-e29b-41d4-a716-446655440000" \
  -H "Accept: application/json" \
  -H "Cookie: neptun-session=your-session-cookie"
```

### Python Example

```python
import httpx

async def delete_user_collection(
    user_id: int,
    collection_uuid: str,
    session_cookie: str
) -> bool:
    url = f"https://neptun-webui.vercel.app/api/users/{user_id}/collections/{collection_uuid}"

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
async function deleteUserCollection(
  userId: number,
  collectionUuid: string,
  sessionCookie: string
): Promise<boolean> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}/collections/${collectionUuid}`,
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
- The collection must belong to the specified user
- All templates within the collection will also be deleted
- This operation cannot be undone
