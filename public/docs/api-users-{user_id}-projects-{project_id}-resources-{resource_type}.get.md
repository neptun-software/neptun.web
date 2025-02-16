# List Project Resources Endpoint

## Overview

This endpoint allows users to retrieve a list of resources of a specific type for a project.

## Request Details

### HTTP Method

GET

### Route

`/api/users/{user_id}/projects/{project_id}/resources/{resource_type}`

### Route Parameters

| Parameter     | Type    | Required | Description                                                                                                 |
| ------------- | ------- | -------- | ----------------------------------------------------------------------------------------------------------- |
| user_id       | integer | Yes      | The ID of the authenticated user                                                                            |
| project_id    | integer | Yes      | The ID of the project                                                                                       |
| resource_type | string  | Yes      | Type of resource (e.g., 'user-files', 'template-collections', 'github-installations', 'chat-conversations') |

### Headers

| Header | Value            | Required | Description                   |
| ------ | ---------------- | -------- | ----------------------------- |
| Accept | application/json | Yes      | Specifies the response format |
| Cookie | neptun-session   | Yes      | Session authentication cookie |

### Query Parameters

Query parameters vary depending on the resource type:

#### For user-files

No additional parameters

#### For template-collections

No additional parameters

#### For github-installations

No additional parameters

#### For chat-conversations

No additional parameters

## Response Format

### Response Status Codes

| Status Code | Description                               |
| ----------- | ----------------------------------------- |
| 200         | Successfully retrieved resources          |
| 400         | Bad request (invalid parameters)          |
| 401         | Unauthorized (invalid or missing session) |
| 403         | Forbidden (user_id mismatch)              |
| 404         | Project or resources not found            |
| 500         | Server error                              |

### Success Response (200 OK)

Response varies based on the resource type:

#### For user files

```json
[
  {
    "id": 123,
    "title": "My File",
    "text": "File content",
    "language": "typescript",
    "extension": "ts",
    "created_at": "2025-02-16T17:42:11.000Z",
    "updated_at": "2025-02-16T17:42:11.000Z"
  }
]
```

#### For template collections

```json
[
  {
    "id": 123,
    "name": "My Template Collection",
    "description": "Collection description",
    "is_shared": false,
    "share_uuid": "550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2025-02-16T17:42:11.000Z",
    "updated_at": "2025-02-16T17:42:11.000Z"
  }
]
```

#### For github installations

```json
[
  {
    "id": 123,
    "installation_id": "12345",
    "account_name": "username",
    "repository_selection": "selected",
    "created_at": "2025-02-16T17:42:11.000Z",
    "updated_at": "2025-02-16T17:42:11.000Z"
  }
]
```

#### For chat conversations

```json
[
  {
    "id": 123,
    "name": "My Chat",
    "description": "Chat description",
    "model_publisher": "openai",
    "model_name": "gpt-4",
    "created_at": "2025-02-16T17:42:11.000Z",
    "updated_at": "2025-02-16T17:42:11.000Z"
  }
]
```

### Error Response (400 Bad Request)

```json
{
  "statusCode": 400,
  "message": "Invalid resource type"
}
```

## Code Examples

### cURL Example

```bash
curl -X GET "https://neptun-webui.vercel.app/api/users/1/projects/789/resources/user-files" \
  -H "Accept: application/json" \
  -H "Cookie: neptun-session=your-session-cookie"
```

### Python Example

```python
import httpx
from typing import Literal, TypedDict, List
from datetime import datetime

ResourceType = Literal['user-files', 'template-collections', 'github-installations', 'chat-conversations']

class BaseResource(TypedDict):
    id: int
    created_at: datetime
    updated_at: datetime

class UserFile(BaseResource):
    title: str
    text: str
    language: str
    extension: str

class TemplateCollection(BaseResource):
    name: str
    description: str
    is_shared: bool
    share_uuid: str

class GithubInstallation(BaseResource):
    installation_id: str
    account_name: str
    repository_selection: str

class ChatConversation(BaseResource):
    name: str
    description: str
    model_publisher: str
    model_name: str

ResourceResponse = List[Union[UserFile, TemplateCollection, GithubInstallation, ChatConversation]]

async def list_project_resources(
    user_id: int,
    project_id: int,
    resource_type: ResourceType,
    session_cookie: str
) -> ResourceResponse:
    url = f"https://neptun-webui.vercel.app/api/users/{user_id}/projects/{project_id}/resources/{resource_type}"

    async with httpx.AsyncClient() as client:
        response = await client.get(
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
type ResourceType = 'user-files' | 'template-collections' | 'github-installations' | 'chat-conversations'

interface BaseResource {
  id: number
  created_at: string
  updated_at: string
}

interface UserFile extends BaseResource {
  title: string
  text: string
  language: string
  extension: string
}

interface TemplateCollection extends BaseResource {
  name: string
  description: string
  is_shared: boolean
  share_uuid: string
}

interface GithubInstallation extends BaseResource {
  installation_id: string
  account_name: string
  repository_selection: string
}

interface ChatConversation extends BaseResource {
  name: string
  description: string
  model_publisher: string
  model_name: string
}

type ResourceResponse = UserFile[] | TemplateCollection[] | GithubInstallation[] | ChatConversation[]

async function listProjectResources(
  userId: number,
  projectId: number,
  resourceType: ResourceType,
  sessionCookie: string
): Promise<ResourceResponse> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}/projects/${projectId}/resources/${resourceType}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Cookie: `neptun-session=${sessionCookie}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}
```

## Notes

- The session cookie is required for authentication
- The project must belong to the specified user
- The resource_type must be one of the allowed values
- All IDs must be valid positive integers
- Returns an array of resources of the specified type
- If no resources exist, returns an empty array
- Results are sorted by creation date in descending order
- Response structure varies based on resource type:
  - user-files: includes file content and metadata
  - template-collections: includes sharing information
  - github-installations: includes GitHub account details
  - chat-conversations: includes model configuration
- All timestamps are in ISO 8601 format with UTC timezone
