# Get GitHub App Installations Endpoint

## Overview

This endpoint retrieves all GitHub App installations associated with a specific user.

## Request Details

### HTTP Method

GET

### Route

`/api/users/{user_id}/installations`

### Route Parameters

| Parameter | Type    | Required | Description                   |
| --------- | ------- | -------- | ----------------------------- |
| user_id   | integer | Yes      | Unique identifier of the user |

### Headers

| Header | Value          | Required | Description                   |
| ------ | -------------- | -------- | ----------------------------- |
| Cookie | neptun-session | Yes      | Session authentication cookie |

### Query Parameters

No query parameters required.

### Request Body

No request body required.

## Response Format

### Response Status Codes

| Status Code | Description                               |
| ----------- | ----------------------------------------- |
| 200         | Successfully retrieved installations      |
| 401         | Unauthorized (invalid or missing session) |
| 404         | User not found                            |
| 500         | Server error                              |

### Success Response (200 OK)

```json
[
  {
    "id": 1,
    "github_account_name": "octocat",
    "github_account_type": "User",
    "github_account_avatar_url": "https://avatars.githubusercontent.com/u/123456?v=4",
    "created_at": "2024-03-20T10:00:00Z",
    "updated_at": "2024-03-20T10:00:00Z"
  }
]
```

### Error Response (404 Not Found)

```json
{
  "statusCode": 404,
  "statusMessage": "Not Found",
  "data": {
    "message": "User not found"
  }
}
```

### TypeScript Interfaces

```typescript
interface GithubAppInstallation {
  id: number
  github_account_name: string
  github_account_type: string
  github_account_avatar_url: string
  created_at: string
  updated_at: string
}

interface GetInstallationsError {
  statusCode: number
  statusMessage: string
  data: {
    message: string
  }
}
```

### Python Models

```python
from pydantic import BaseModel
from datetime import datetime

class GithubAppInstallation(BaseModel):
    id: int
    github_account_name: str
    github_account_type: str
    github_account_avatar_url: str
    created_at: datetime
    updated_at: datetime

class GetInstallationsError(BaseModel):
    statusCode: int
    statusMessage: str
    data: dict[str, str]
```

## Code Examples

### Python Example

```python
from typing import List

async def get_github_installations(
    user_id: int,
    session_cookie: str
) -> List[GithubAppInstallation]:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://neptun-webui.vercel.app/api/users/{user_id}/installations",
            cookies={"neptun-session": session_cookie}
        )
        response.raise_for_status()
        return [GithubAppInstallation(**installation) for installation in response.json()]
```

### cURL Example

```bash
curl -X GET \
  -H "Cookie: neptun-session=your-session-cookie" \
  "https://neptun-webui.vercel.app/api/users/your-user-id/installations"
```

### TypeScript/JavaScript Example

```typescript
async function getGithubInstallations(
  userId: number
): Promise<GithubAppInstallation[]> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}/installations`,
    {
      credentials: 'include', // Important for cookie handling
    }
  )

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return await response.json() as GithubAppInstallation[]
}
```

## Notes

- The session cookie is required for authentication
- Returns an empty array if no installations are found
- Each installation represents a GitHub App installation in a repository or organization
- The github_installation_id is the unique identifier provided by GitHub
- Installation data includes creation and last update timestamps
