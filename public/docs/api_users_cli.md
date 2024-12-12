# CLI Configuration Endpoint

## Overview

This endpoint retrieves the CLI configuration for a specific user, including authentication details and API settings.

## Request Details

### HTTP Method

GET

### Route

`/api/users/{user_id}/cli`

### Route Parameters

| Parameter | Type   | Required | Description                    |
|-----------|--------|----------|--------------------------------|
| user_id   | string | Yes      | Unique identifier of the user  |

### Headers

| Header         | Value            | Required | Description                    |
|----------------|------------------|----------|--------------------------------|
| Cookie         | neptun-session   | Yes      | Session authentication cookie  |

### Query Parameters

No query parameters required.

### Request Body

No request body required.

## Response Format

### Success Response (200 OK)

Returns the CLI configuration object.

#### TypeScript Interface

```typescript
interface CliConfiguration {
  utils: {
    neptun_api_server_host: string;
    neptun_github_app_url: string;
  };
  auth: {
    neptun_session_cookie: string;
    user: {
      id: string;
      email: string;
      oauth: any;
    };
  };
  active_chat: {
    chat_id: number;
    chat_name: string;
    model: string;
  };
}
```

#### Example Response

```json
{
  "utils": {
    "neptun_api_server_host": "https://neptun-webui.vercel.app/api",
    "neptun_github_app_url": "https://github.com/apps/neptun-github-app/installations/new"
  },
  "auth": {
    "neptun_session_cookie": "session-cookie-value",
    "user": {
      "id": "user123",
      "email": "user@example.com",
      "oauth": null
    }
  },
  "active_chat": {
    "chat_id": -1,
    "chat_name": "chat-1679305200000",
    "model": "default-model"
  }
}
```

### Error Responses

#### Unauthorized (401)

```json
{
  "statusCode": 401,
  "statusMessage": "Unauthorized",
  "message": "User session required"
}
```

## Code Examples

### Python Example (using httpx)

```python
from pydantic import BaseModel, EmailStr
import httpx
from typing import Optional, Any

class UserInfo(BaseModel):
    id: str
    email: EmailStr
    oauth: Optional[Any]

class Utils(BaseModel):
    neptun_api_server_host: str
    neptun_github_app_url: str

class Auth(BaseModel):
    neptun_session_cookie: str
    user: UserInfo

class ActiveChat(BaseModel):
    chat_id: int
    chat_name: str
    model: str

class CliConfiguration(BaseModel):
    utils: Utils
    auth: Auth
    active_chat: ActiveChat

async def get_cli_config(user_id: str, session_cookie: str) -> CliConfiguration:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://neptun-webui.vercel.app/api/users/{user_id}/cli",
            cookies={"neptun-session": session_cookie}
        )
        response.raise_for_status()
        return CliConfiguration(**response.json())
```

### cURL Example

```bash
curl -X GET "https://neptun-webui.vercel.app/api/users/your-user-id/cli" \
  -H "Cookie: neptun-session=your-session-cookie"
```

### TypeScript/JavaScript Example (using fetch)

```typescript
async function getCliConfig(userId: string): Promise<CliConfiguration> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}/cli`,
    {
      credentials: 'include', // Important for cookie handling
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json() as CliConfiguration;
}
```

### Response Status Codes

| Status Code | Description                                        |
|-------------|----------------------------------------------------|
| 200         | Successfully retrieved CLI configuration           |
| 401         | Unauthorized (invalid or missing session)          |
| 404         | User not found                                    |
| 500         | Server error                                      |

## Notes

- The session cookie is required for authentication
- The endpoint returns configuration needed for the Neptun CLI tool
- The active chat configuration includes a default chat ID of -1
- The chat name is generated using the current timestamp
