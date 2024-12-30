# User Template Deletion Endpoint

## Overview

This endpoint allows users to delete a specific template from a collection.

## Request Details

### HTTP Method

DELETE

### Route

`/api/users/{user_id}/collections/{uuid}/templates/{id}`

### Route Parameters

| Parameter | Type    | Required | Description                                     |
|-----------|---------|----------|-------------------------------------------------|
| user_id   | integer | Yes      | The ID of the authenticated user               |
| uuid      | string  | Yes      | The unique identifier of the template collection |
| id        | integer | Yes      | The ID of the template                         |

### Headers

| Header          | Value            | Required | Description                    |
|-----------------|------------------|----------|--------------------------------|
| Accept          | application/json | Yes      | Specifies the response format |
| Cookie          | neptun-session   | Yes      | Session authentication cookie |

## Response Format

### Success Response (200 OK)

Returns `true` on successful deletion.

### TypeScript Types

```typescript
type ApiResponse = boolean;
```

### Python Types

```python
from pydantic import BaseModel

class ApiResponse(BaseModel):
    success: bool
```

## Code Examples

### cURL

```bash
curl -X DELETE "https://neptun-webui.vercel.app/api/users/1/collections/550e8400-e29b-41d4-a716-446655440000/templates/1" \
  -H "Accept: application/json" \
  -H "Cookie: neptun-session=your-session-cookie"
```

### Python Example (using httpx)

```python
import httpx

async def delete_template(
    user_id: int,
    collection_uuid: str,
    template_id: int,
    session_cookie: str
) -> bool:
    url = f"https://neptun-webui.vercel.app/api/users/{user_id}/collections/{collection_uuid}/templates/{template_id}"
    
    async with httpx.AsyncClient() as client:
        response = await client.delete(
            url,
            headers={"Cookie": f"neptun-session={session_cookie}"}
        )
        response.raise_for_status()
        return response.json()
```

### TypeScript Example (using fetch)

```typescript
async function deleteTemplate(
  userId: number,
  collectionUuid: string,
  templateId: number,
  sessionCookie: string
): Promise<boolean> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}/collections/${collectionUuid}/templates/${templateId}`,
    {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Cookie': `neptun-session=${sessionCookie}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}
```

## Example Responses

### Success Response

```json
true
```

### Error Response

```json
{
  "statusCode": 404,
  "message": "Template not found"
}
```

### Response Status Codes

| Status Code | Description                                |
|-------------|--------------------------------------------|
| 200         | Successfully deleted template              |
| 401         | Unauthorized (invalid or missing session)   |
| 403         | Forbidden (user_id mismatch)               |
| 404         | Template not found                         |
| 500         | Server error                               | 
