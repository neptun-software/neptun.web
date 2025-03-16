# Project Context Markdown Get Endpoint

## Overview

This endpoint retrieves the system prompt/context for a specific project in markdown format. The context includes information about the project's identity, goals, rules, and associated resources, formatted as a structured markdown document.

## Request Details

### HTTP Method

GET

### Route

`/api/users/{user_id}/projects/{project_id}/context/markdown`

### Route Parameters

| Parameter  | Type    | Required | Description                      |
| ---------- | ------- | -------- | -------------------------------- |
| user_id    | integer | Yes      | The ID of the authenticated user |
| project_id | integer | Yes      | The ID of the project            |

### Headers

| Header | Value          | Required | Description                   |
| ------ | -------------- | -------- | ----------------------------- |
| Accept | text/markdown  | Yes      | Specifies the response format |
| Cookie | neptun-session | Yes      | Session authentication cookie |

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

````markdown
# Project Context

## Goal

You are an AI assistant for the web-app project "My Project". Your goal is to help the user with their typescript project.

## Return Format

Provide clear, concise, and helpful responses related to the project context using markdown syntax.

## Rules

- Do not make assumptions about project requirements that are not specified in the context.
- If you are unsure about something, ask for clarification rather than guessing.

## Project Details

- **Name:** My Project
- **Description:** A sample project
- **Type:** web-app
- **Main Language:** typescript

## Template Collections

### Collection: React Components
- **Description:** Common React component templates
- **Shared:** Yes
- **Share UUID:** 550e8400-e29b-41d4-a716-446655440000

#### Templates

##### Button.tsx
- **Description:** Reusable button component
- **Title:** Button Component
- **Language:** typescript
- **Extension:** tsx

**Content:**
```typescript
import React from 'react';

interface Props {
  label: string;
  onClick: () => void;
}

export default function Button(props: Props) {
  return <button onClick={props.onClick}>{props.label}</button>;
}
```

## Context Imports

### Import Source: local_folder
- **Source Path:** /src
- **Source Reference:** main
- **Status:** completed
- **Error Message:** 

#### File Tree
```json
{
  "src": {
    "components": {
      "Button.tsx": null
    }
  }
}
```

#### Context Files

##### Button.tsx
- **Original Path:** src/components/Button.tsx
- **Type:** text
- **Category:** unknown
- **Size:** 156 bytes
- **PDF URL:** 
- **Language:** typescript
- **Parent Path:** /src/components
- **Depth:** 2

**Metadata:**
```json
{
  "lastModified": "2024-03-20T10:00:00Z"
}
```

**Content:**
```typescript
import React from 'react';

interface Props {
  label: string;
  onClick: () => void;
}

export default function Button(props: Props) {
  return <button onClick={props.onClick}>{props.label}</button>;
}
```

---

*Last Updated: 2024-03-20T10:00:00.000Z*
````

### Error Response (404 Not Found)

```json
{
  "statusCode": 404,
  "statusMessage": "Project context not found"
}
```

## Code Examples

### cURL Example

```bash
curl -X GET "https://neptun-webui.vercel.app/api/users/1/projects/1/context/markdown" \
  -H "Accept: text/markdown" \
  -H "Cookie: neptun-session=your-session-cookie"
```

### TypeScript/JavaScript Example

```typescript
import type { ProjectPromptContext } from './models'

async function getProjectContextMarkdown(
  userId: number,
  projectId: number,
  sessionCookie: string
): Promise<string> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}/projects/${projectId}/context/markdown`,
    {
      method: 'GET',
      headers: {
        Accept: 'text/markdown',
        Cookie: `neptun-session=${sessionCookie}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return await response.text()
}
```

### Python Example

```python
import httpx
from models import ProjectPromptContext

async def get_project_context_markdown(
    user_id: int,
    project_id: int,
    session_cookie: str
) -> str:
    url = f"https://neptun-webui.vercel.app/api/users/{user_id}/projects/{project_id}/context/markdown"

    async with httpx.AsyncClient() as client:
        response = await client.get(
            url,
            headers={
                "Accept": "text/markdown",
                "Cookie": f"neptun-session={session_cookie}"
            }
        )
        response.raise_for_status()
        return response.text
```

## Notes

- The session cookie is required for authentication
- The response is formatted as a structured markdown document
- The markdown format includes sections for identity, goal, project details, rules, resources, and response format
- All timestamps are formatted in the local timezone
