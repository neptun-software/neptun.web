# Project Context Update Endpoint

## Overview

This endpoint generates and returns a system prompt/context for a specific project based on the project's current state, including its resources, files, and settings.

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

## Response Format

### Response Status Codes

| Status Code | Description                               |
| ----------- | ----------------------------------------- |
| 200         | Successfully generated project context    |
| 400         | Invalid parameters                        |
| 401         | Unauthorized (invalid or missing session) |
| 404         | Project not found                         |
| 500         | Failed to generate project context        |

### Success Response (200 OK)

```json
{
  "context": {
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
      "main_language": "typescript"
    },
    "resources": {
      "collections": [
        {
          "name": "React Components",
          "description": "Common React component templates",
          "is_shared": true,
          "share_uuid": "550e8400-e29b-41d4-a716-446655440000",
          "templates": [
            {
              "file_name": "Button.tsx",
              "description": "Reusable button component",
              "neptun_user_file": {
                "title": "Button Component",
                "text": "import React from 'react';\n\ninterface Props {\n  label: string;\n  onClick: () => void;\n}\n\nexport default function Button(props: Props) {\n  return <button onClick={props.onClick}>{props.label}</button>;\n}",
                "language": "typescript",
                "extension": "tsx"
              }
            }
          ]
        }
      ],
      "imports": [
        {
          "source_type": "local_folder",
          "source_path": "/src",
          "source_ref": "main",
          "import_status": "completed",
          "error_message": null,
          "file_tree": {
            "src": {
              "components": {
                "Button.tsx": null
              }
            }
          },
          "context_files": [
            {
              "title": "Button.tsx",
              "original_path": "src/components/Button.tsx",
              "content": "import React from 'react';\n\ninterface Props {\n  label: string;\n  onClick: () => void;\n}\n\nexport default function Button(props: Props) {\n  return <button onClick={props.onClick}>{props.label}</button>;\n}",
              "file_type": "text",
              "category": "unknown",
              "file_size": 156,
              "pdf_url": null,
              "language": "typescript",
              "metadata": {
                "lastModified": "2024-03-20T10:00:00Z"
              },
              "parent_path": "/src/components",
              "depth": 2
            }
          ]
        }
      ]
    },
    "currentDate": "2024-03-20T10:00:00.000Z"
  }
}
```

### Error Response (500 Server Error)

```json
{
  "statusCode": 500,
  "statusMessage": "Failed to generate project context"
}
```

### TypeScript Interface

```typescript
interface ProjectPromptContext {
  goal: string
  returnFormat: string
  rules: string[]
  project: {
    name: string
    description: string | null
    type: string
    main_language: string
  }
  resources: {
    collections: Array<{
      name: string
      description: string | null
      is_shared: boolean
      share_uuid: string
      templates: Array<{
        file_name: string
        description: string | null
        neptun_user_file: {
          title: string | null
          text: string
          language: string
          extension: string
        } | null
      }>
    }>
    imports: Array<{
      source_type: 'local_folder' | 'github_repository_installation' | 'public_github_repository_url'
      source_path: string
      source_ref: string | null
      import_status: string
      error_message: string | null
      file_tree: unknown
      context_files: Array<{
        title: string
        original_path: string
        content: string
        file_type: 'markdown' | 'pdf' | 'text'
        category: ('bundler' | 'build_tool' | 'server' | 'package_manager' | 'runtime' | 'documentation' | 'test_tool' | 'unknown') | null
        file_size: number | null
        pdf_url: string | null
        language: string
        metadata: unknown
        parent_path: string | null
        depth: number | null
      }>
    }>
  }
  currentDate: string
}

interface ApiResponse {
  context: ProjectPromptContext
}
```

## Code Examples

### cURL Example

```bash
curl -X POST "https://neptun-webui.vercel.app/api/users/1/projects/1/context" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Cookie: neptun-session=your-session-cookie"
```

### TypeScript/JavaScript Example

```typescript
import type { ProjectPromptContext } from './models'

interface ApiResponse {
  context: ProjectPromptContext
}

async function generateProjectContext(
  userId: number,
  projectId: number,
  sessionCookie: string
): Promise<ApiResponse> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}/projects/${projectId}/context`,
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Cookie': `neptun-session=${sessionCookie}`,
      }
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
from pydantic import BaseModel
from typing import Optional, List, Dict, Any, Union, Literal

class ProjectPromptContext(BaseModel):
    goal: str
    returnFormat: str
    rules: List[str]
    project: Dict[str, Optional[str]]
    resources: Dict[str, List[Any]]
    currentDate: str

class ApiResponse(BaseModel):
    context: ProjectPromptContext

async def generate_project_context(
    user_id: int,
    project_id: int,
    session_cookie: str
) -> ApiResponse:
    url = f"https://neptun-webui.vercel.app/api/users/{user_id}/projects/{project_id}/context"

    async with httpx.AsyncClient() as client:
        response = await client.post(
            url,
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
- The endpoint generates a new context based on the project's current state
- All timestamps are in ISO 8601 format
- The response includes the complete generated context with project details and resources
