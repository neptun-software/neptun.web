# Create Project Resource Endpoint

## Overview

This endpoint allows users to create a new resource for a specific project.

## Request Details

### HTTP Method

POST

### Route

`/api/users/{user_id}/projects/{project_id}/resources/{resource_type}`

### Route Parameters

| Parameter     | Type    | Required | Description                                                                                                 |
| ------------- | ------- | -------- | ----------------------------------------------------------------------------------------------------------- |
| user_id       | integer | Yes      | The ID of the authenticated user                                                                            |
| project_id    | integer | Yes      | The ID of the project                                                                                       |
| resource_type | string  | Yes      | Type of resource (e.g., 'user-files', 'template-collections', 'github-installations', 'chat-conversations') |

### Headers

| Header       | Value            | Required | Description                   |
| ------------ | ---------------- | -------- | ----------------------------- |
| Accept       | application/json | Yes      | Specifies the response format |
| Content-Type | application/json | Yes      | Request body format           |
| Cookie       | neptun-session   | Yes      | Session authentication cookie |

### Request Body

The request body varies depending on the resource type:

#### For user-files

```json
{
  "title": "My File",
  "text": "File content",
  "language": "typescript",
  "extension": "ts"
}
```

#### For template-collections

```json
{
  "name": "My Template Collection",
  "description": "Collection description",
  "is_shared": false
}
```

#### For github-installations

```json
{
  "installation_id": "12345",
  "account_name": "username",
  "repository_selection": "selected"
}
```

#### For chat-conversations

```json
{
  "name": "My Chat",
  "description": "Chat description",
  "model_publisher": "openai",
  "model_name": "gpt-4"
}
```

## Response Format

### Response Status Codes

| Status Code | Description                               |
| ----------- | ----------------------------------------- |
| 201         | Successfully created resource             |
| 400         | Bad request (invalid parameters)          |
| 401         | Unauthorized (invalid or missing session) |
| 403         | Forbidden (user_id mismatch)              |
| 404         | Project not found                         |
| 500         | Server error                              |

### Success Response (201 Created)

Response varies based on the resource type. See the GET endpoint documentation for response structure details.

### Error Response (400 Bad Request)

```json
{
  "statusCode": 400,
  "message": "Invalid request parameters"
}
```

## Code Examples

### cURL Example

```bash
curl -X POST "https://neptun-webui.vercel.app/api/users/1/projects/789/resources/user-files" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Cookie: neptun-session=your-session-cookie" \
  -d '{
    "title": "My File",
    "text": "File content",
    "language": "typescript",
    "extension": "ts"
  }'
```

### Python Example

```python
import httpx
from typing import Literal, TypedDict, Union
from datetime import datetime

ResourceType = Literal['user-files', 'template-collections', 'github-installations', 'chat-conversations']

class UserFileRequest(TypedDict):
    title: str
    text: str
    language: str
    extension: str

class TemplateCollectionRequest(TypedDict):
    name: str
    description: str
    is_shared: bool

class GithubInstallationRequest(TypedDict):
    installation_id: str
    account_name: str
    repository_selection: str

class ChatConversationRequest(TypedDict):
    name: str
    description: str
    model_publisher: str
    model_name: str

ResourceRequest = Union[UserFileRequest, TemplateCollectionRequest, GithubInstallationRequest, ChatConversationRequest]

async def create_project_resource(
    user_id: int,
    project_id: int,
    resource_type: ResourceType,
    resource_data: ResourceRequest,
    session_cookie: str
) -> dict:
    url = f"https://neptun-webui.vercel.app/api/users/{user_id}/projects/{project_id}/resources/{resource_type}"

    async with httpx.AsyncClient() as client:
        response = await client.post(
            url,
            headers={
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Cookie": f"neptun-session={session_cookie}"
            },
            json=resource_data
        )
        response.raise_for_status()
        return response.json()
```

### TypeScript/JavaScript Example

```typescript
type ResourceType = 'user-files' | 'template-collections' | 'github-installations' | 'chat-conversations'

interface UserFileRequest {
  title: string
  text: string
  language: string
  extension: string
}

interface TemplateCollectionRequest {
  name: string
  description: string
  is_shared: boolean
}

interface GithubInstallationRequest {
  installation_id: string
  account_name: string
  repository_selection: string
}

interface ChatConversationRequest {
  name: string
  description: string
  model_publisher: string
  model_name: string
}

type ResourceRequest = UserFileRequest | TemplateCollectionRequest | GithubInstallationRequest | ChatConversationRequest

async function createProjectResource(
  userId: number,
  projectId: number,
  resourceType: ResourceType,
  resourceData: ResourceRequest,
  sessionCookie: string
): Promise<any> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}/projects/${projectId}/resources/${resourceType}`,
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Cookie': `neptun-session=${sessionCookie}`,
      },
      body: JSON.stringify(resourceData),
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
- Required fields vary by resource type:
  - user-files: title, text, language, extension
  - template-collections: name, description
  - github-installations: installation_id, account_name, repository_selection
  - chat-conversations: name, description, model_publisher, model_name
- The created resource will be automatically associated with the specified project
- The response will include the created resource with its assigned ID and timestamps
