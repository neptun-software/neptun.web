# Project Context Get Endpoint

## Overview

This endpoint retrieves the system prompt/context for a specific project. The context includes information about the project's identity, goals, rules, and associated resources.

## Request Details

### HTTP Method

GET

### Route

`/api/users/{user_id}/projects/{project_id}/context`

### Route Parameters

| Parameter  | Type    | Required | Description                      |
| ---------- | ------- | -------- | -------------------------------- |
| user_id    | integer | Yes      | The ID of the authenticated user |
| project_id | integer | Yes      | The ID of the project            |

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
| 200         | Successfully retrieved project context    |
| 400         | Invalid parameters                        |
| 401         | Unauthorized (invalid or missing session) |
| 404         | Project or context not found              |
| 500         | Server error                              |

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

### Error Response (404 Not Found)

```json
{
  "statusCode": 404,
  "statusMessage": "Project context not found"
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

### Python Model

```python
from datetime import datetime
from typing import List, Optional, Union, Any
from enum import Enum
from pydantic import BaseModel

class ImportSourceType(str, Enum):
    LOCAL_FOLDER = 'local_folder'
    GITHUB_REPOSITORY_INSTALLATION = 'github_repository_installation'
    PUBLIC_GITHUB_REPOSITORY_URL = 'public_github_repository_url'

class FileType(str, Enum):
    MARKDOWN = 'markdown'
    PDF = 'pdf'
    TEXT = 'text'

class FileCategory(str, Enum):
    BUNDLER = 'bundler'
    BUILD_TOOL = 'build_tool'
    SERVER = 'server'
    PACKAGE_MANAGER = 'package_manager'
    RUNTIME = 'runtime'
    DOCUMENTATION = 'documentation'
    TEST_TOOL = 'test_tool'
    UNKNOWN = 'unknown'

class UserFile(BaseModel):
    title: Optional[str]
    text: str
    language: str
    extension: str

class Template(BaseModel):
    file_name: str
    description: Optional[str]
    neptun_user_file: Optional[UserFile]

class Collection(BaseModel):
    name: str
    description: Optional[str]
    is_shared: bool
    share_uuid: str
    templates: List[Template]

class ContextFile(BaseModel):
    title: str
    original_path: str
    content: str
    file_type: FileType
    category: Optional[FileCategory]
    file_size: Optional[int]
    pdf_url: Optional[str]
    language: str
    metadata: Any
    parent_path: Optional[str]
    depth: Optional[int]

class Import(BaseModel):
    source_type: ImportSourceType
    source_path: str
    source_ref: Optional[str]
    import_status: str
    error_message: Optional[str]
    file_tree: Any
    context_files: List[ContextFile]

class Project(BaseModel):
    name: str
    description: Optional[str]
    type: str
    main_language: str

class Resources(BaseModel):
    collections: List[Collection]
    imports: List[Import]

class ProjectPromptContext(BaseModel):
    goal: str
    returnFormat: str
    rules: List[str]
    project: Project
    resources: Resources
    currentDate: str

class ApiResponse(BaseModel):
    context: ProjectPromptContext
```

## Code Examples

### cURL Example

```bash
curl -X GET "https://neptun-webui.vercel.app/api/users/1/projects/1/context" \
  -H "Accept: application/json" \
  -H "Cookie: neptun-session=your-session-cookie"
```

### TypeScript/JavaScript Example

```typescript
import type { ProjectPromptContext } from './models'

interface ApiResponse {
  context: ProjectPromptContext
}

async function getProjectContext(
  userId: number,
  projectId: number,
  sessionCookie: string
): Promise<ApiResponse> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}/projects/${projectId}/context`,
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

  return await response.json()
}
```

### Python Example

```python
import httpx
from models import ProjectPromptContext

class ApiResponse(BaseModel):
    context: ProjectPromptContext

async def get_project_context(
    user_id: int,
    project_id: int,
    session_cookie: str
) -> ApiResponse:
    url = f"https://neptun-webui.vercel.app/api/users/{user_id}/projects/{project_id}/context"

    async with httpx.AsyncClient() as client:
        response = await client.get(
            url,
            headers={
                "Accept": "application/json",
                "Cookie": f"neptun-session={session_cookie}"
            }
        )
        response.raise_for_status()
        return ApiResponse(**response.json())
```

## Notes

- The session cookie is required for authentication
- The context is automatically generated if it doesn't exist
- The context is updated whenever project resources are modified
- All timestamps are in ISO 8601 format
