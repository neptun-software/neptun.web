# Project Context Update Endpoint

## Overview

This endpoint updates the system prompt/context for a specific project. The context can be provided in the request body, or if omitted, a new context will be generated based on the project's current state.

## Request Details

### HTTP Method

POST

### Route

`/api/users/{user_id}/projects/{project_id}/context`

### Route Parameters

| Parameter  | Type    | Required | Description                      |
| ---------- | ------- | -------- | -------------------------------- |
| user_id    | integer | Yes      | The ID of the authenticated user |
| project_id | integer | Yes      | The ID of the project            |

### Headers

| Header       | Value            | Required | Description                   |
| ------------ | ---------------- | -------- | ----------------------------- |
| Accept       | application/json | Yes      | Specifies the response format |
| Content-Type | application/json | Yes      | Specifies the request format  |
| Cookie       | neptun-session   | Yes      | Session authentication cookie |

### Request Body

```json
{
  "context": {
    "identity": {
      "name": "My Project Assistant",
      "creator": "Neptun AI"
    },
    "goal": "You are an AI assistant for the web-app project \"My Project\". Your goal is to help the user with their typescript project.",
    "returnFormat": "Provide clear, concise, and helpful responses related to the project context using markdown syntax.",
    "rules": [
      "Do not make assumptions about project requirements that are not specified in the context.",
      "If you are unsure about something, ask for clarification rather than guessing."
    ],
    "project": {
      "name": "My Project",
      "description": "A sample project",
      "type": "web-app",
      "main_language": "typescript",
      "created_at": "2024-03-20T10:00:00Z",
      "updated_at": "2024-03-20T10:00:00Z"
    },
    "resources": {
      "files": [
        {
          "id": 1,
          "title": "index.ts",
          "language": "typescript",
          "extension": "ts",
          "content": "import React from 'react';\n\nexport default function App() {\n  return <div>Hello World</div>;\n}",
          "summary": ""
        }
      ],
      "templates": [
        {
          "id": 1,
          "name": "React Component",
          "description": "A template for creating React components",
          "content": "import React from 'react';\n\ninterface Props {\n  // Add props here\n}\n\nexport default function Component(props: Props) {\n  return <div>New Component</div>;\n}"
        }
      ]
    },
    "currentDate": "2024-03-20T10:00:00Z"
  }
}
```

The request body is optional. If omitted, a new context will be generated based on the project's current state.

## Response Format

### Response Status Codes

| Status Code | Description                               |
| ----------- | ----------------------------------------- |
| 200         | Successfully updated project context      |
| 400         | Invalid parameters                        |
| 401         | Unauthorized (invalid or missing session) |
| 404         | Project not found                         |
| 500         | Failed to update project context          |

### Success Response (200 OK)

```json
{
  "context": {
    "identity": {
      "name": "My Project Assistant",
      "creator": "Neptun AI"
    },
    "goal": "You are an AI assistant for the web-app project \"My Project\". Your goal is to help the user with their typescript project.",
    "returnFormat": "Provide clear, concise, and helpful responses related to the project context using markdown syntax.",
    "rules": [
      "Do not make assumptions about project requirements that are not specified in the context.",
      "If you are unsure about something, ask for clarification rather than guessing."
    ],
    "project": {
      "name": "My Project",
      "description": "A sample project",
      "type": "web-app",
      "main_language": "typescript",
      "created_at": "2024-03-20T10:00:00Z",
      "updated_at": "2024-03-20T10:00:00Z"
    },
    "resources": {
      "files": [
        {
          "id": 1,
          "title": "index.ts",
          "language": "typescript",
          "extension": "ts",
          "content": "import React from 'react';\n\nexport default function App() {\n  return <div>Hello World</div>;\n}",
          "summary": ""
        }
      ],
      "templates": [
        {
          "id": 1,
          "name": "React Component",
          "description": "A template for creating React components",
          "content": "import React from 'react';\n\ninterface Props {\n  // Add props here\n}\n\nexport default function Component(props: Props) {\n  return <div>New Component</div>;\n}"
        }
      ]
    },
    "currentDate": "2024-03-20T10:00:00Z"
  }
}
```

### Error Response (500 Server Error)

```json
{
  "statusCode": 500,
  "statusMessage": "Failed to update project context"
}
```

### TypeScript Interface

```typescript
interface ProjectPromptContext {
  identity: {
    name: string
    creator: string
  }
  goal: string
  returnFormat: string
  rules: string[]
  project: {
    name: string
    description?: string
    type: string
    main_language: string
    created_at: string
    updated_at: string
  }
  resources: {
    files?: {
      id: number
      title: string
      language: string
      extension: string
      content: string
      summary?: string
    }[]
    templates?: {
      id: number
      name: string
      description?: string
      content?: string
    }[]
  }
  currentDate: string
}

interface RequestBody {
  context?: ProjectPromptContext
}

interface ApiResponse {
  context: ProjectPromptContext
}
```

### Python Model

```python
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

class ProjectFile(BaseModel):
    id: int
    title: str
    language: str
    extension: str
    content: str
    summary: Optional[str]

class ProjectTemplate(BaseModel):
    id: int
    name: str
    description: Optional[str]
    content: Optional[str]

class ProjectDetails(BaseModel):
    name: str
    description: Optional[str]
    type: str
    main_language: str
    created_at: datetime
    updated_at: datetime

class ProjectIdentity(BaseModel):
    name: str
    creator: str

class ProjectResources(BaseModel):
    files: Optional[List[ProjectFile]]
    templates: Optional[List[ProjectTemplate]]

class ProjectPromptContext(BaseModel):
    identity: ProjectIdentity
    goal: str
    returnFormat: str
    rules: List[str]
    project: ProjectDetails
    resources: ProjectResources
    currentDate: datetime

class RequestBody(BaseModel):
    context: Optional[ProjectPromptContext]

class ApiResponse(BaseModel):
    context: ProjectPromptContext
```

## Code Examples

### cURL Example

```bash
curl -X POST "https://neptun-webui.vercel.app/api/users/1/projects/1/context" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Cookie: neptun-session=your-session-cookie" \
  -d '{"context": {"identity": {"name": "My Project Assistant", "creator": "Neptun AI"}, ...}}'
```

### TypeScript/JavaScript Example

```typescript
import type { ProjectPromptContext } from './models'

interface RequestBody {
  context?: ProjectPromptContext
}

interface ApiResponse {
  context: ProjectPromptContext
}

async function updateProjectContext(
  userId: number,
  projectId: number,
  sessionCookie: string,
  context?: ProjectPromptContext
): Promise<ApiResponse> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}/projects/${projectId}/context`,
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Cookie': `neptun-session=${sessionCookie}`,
      },
      body: JSON.stringify({ context }),
    }
  )

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return await response.json()
}
```

### Python Example

```python
import httpx
from models import ProjectPromptContext
from pydantic import BaseModel
from typing import Optional

class RequestBody(BaseModel):
    context: Optional[ProjectPromptContext]

class ApiResponse(BaseModel):
    context: ProjectPromptContext

async def update_project_context(
    user_id: int,
    project_id: int,
    session_cookie: str,
    context: Optional[ProjectPromptContext] = None
) -> ApiResponse:
    url = f"https://neptun-webui.vercel.app/api/users/{user_id}/projects/{project_id}/context"
    body = RequestBody(context=context) if context else {}

    async with httpx.AsyncClient() as client:
        response = await client.post(
            url,
            json=body.dict(exclude_none=True),
            headers={
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Cookie": f"neptun-session={session_cookie}"
            }
        )
        response.raise_for_status()
        return ApiResponse(**response.json())
```

## Notes

- The session cookie is required for authentication
- If no context is provided in the request body, a new context will be generated
- The context is validated before being saved
- All timestamps should be in ISO 8601 format
- The response includes the complete updated context
