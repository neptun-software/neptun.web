# Create Chat Files Endpoint

## Overview

This endpoint creates one or multiple files associated with a specific chat message.

## Request Details

### HTTP Method

POST

### Route

`/api/users/{user_id}/chats/{chat_id}/files/{message_id}`

### Route Parameters

| Parameter  | Type    | Required | Description                      |
| ---------- | ------- | -------- | -------------------------------- |
| user_id    | integer | Yes      | Unique identifier of the user    |
| chat_id    | integer | Yes      | Unique identifier of the chat    |
| message_id | integer | Yes      | Unique identifier of the message |

### Headers

| Header       | Value            | Required | Description                   |
| ------------ | ---------------- | -------- | ----------------------------- |
| Content-Type | application/json | Yes      | Indicates JSON request body   |
| Cookie       | neptun-session   | Yes      | Session authentication cookie |

### Query Parameters

No query parameters required.

### Request Body

The endpoint accepts two types of request bodies:

#### Single File Upload

| Field     | Type   | Required | Description            |
| --------- | ------ | -------- | ---------------------- |
| text      | string | Yes      | Content of the file    |
| title     | string | Yes      | Title/name of the file |
| language  | string | Yes      | Programming language   |
| extension | string | Yes      | File extension         |

#### Multiple Files Upload

| Field | Type        | Required | Description           |
| ----- | ----------- | -------- | --------------------- |
| files | FileInput[] | Yes      | Array of file objects |

Where FileInput contains:

- text: string
- title: string
- language: string
- extension: string

## Response Format

### Response Status Codes

| Status Code | Description                               |
| ----------- | ----------------------------------------- |
| 200         | Files successfully created                |
| 400         | Invalid request body                      |
| 401         | Unauthorized (invalid or missing session) |
| 404         | Chat, message, or user not found          |
| 500         | Server error                              |

### Success Response (200 OK)

#### Single File Upload

```json
{
  "chatFile": {
    "id": 1,
    "chat_conversation_id": 123,
    "chat_conversation_message_id": 456,
    "neptun_user_id": 789,
    "title": "example.py",
    "text": "print('Hello, World!')",
    "language": "python",
    "extension": "py",
    "created_at": "2024-03-20T10:00:00Z"
  }
}
```

#### Multiple Files Upload

```json
{
  "chatFiles": [
    {
      "id": 1,
      "chat_conversation_id": 123,
      "chat_conversation_message_id": 456,
      "neptun_user_id": "user123",
      "title": "example1.py",
      "text": "print('Hello')",
      "language": "python",
      "extension": "py",
      "created_at": "2024-03-20T10:00:00Z"
    }
  ]
}
```

### Error Response (400 Bad Request)

```json
{
  "statusCode": 400,
  "statusMessage": "Bad Request. Invalid body(file | files).",
  "data": {
    "issues": [
      {
        "code": "invalid_type",
        "message": "Required"
      }
    ]
  }
}
```

### TypeScript Interface

```typescript
interface FileInput {
  text: string
  title: string
  language: string
  extension: string
}

interface SingleFileRequest {
  text: string
  title: string
  language: string
  extension: string
}

interface MultipleFilesRequest {
  files: FileInput[]
}

interface ChatFile {
  id: number
  chat_conversation_id: number
  chat_conversation_message_id: number
  neptun_user_id: number
  title: string
  text: string
  language: string
  extension: string
  created_at: string
  updated_at: string
}

interface SingleFileResponse {
  chatFile: ChatFile
}

interface MultipleFilesResponse {
  chatFiles: ChatFile[]
}

interface CreateFileError {
  statusCode: number
  statusMessage: string
  data: {
    issues: Array<{
      code: string
      message: string
    }>
  }
}
```

### Python Model

```python
from pydantic import BaseModel
from typing import List
from datetime import datetime

class FileInput(BaseModel):
    text: str
    title: str
    language: str = "text"
    extension: str = "txt"

class MultipleFilesRequest(BaseModel):
    files: List[FileInput]

class ChatFile(BaseModel):
    id: int
    chat_conversation_id: int
    chat_conversation_message_id: int
    neptun_user_id: int
    title: str
    text: str
    language: str = "text"
    extension: str = "txt"
    created_at: datetime
    updated_at: datetime

class SingleFileResponse(BaseModel):
    chatFile: ChatFile

class MultipleFilesResponse(BaseModel):
    chatFiles: List[ChatFile]

class CreateFileError(BaseModel):
    statusCode: int
    statusMessage: str
    data: dict
```

## Code Examples

### cURL Example

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Cookie: neptun-session=your-session-cookie" \
  -d '{
    "files": [
      {
        "text": "print(\"Hello\")",
        "title": "example.py",
        "language": "python",
        "extension": "py"
      }
    ]
  }' \
  "https://neptun-webui.vercel.app/api/users/your-user-id/chats/123/files/456"
```

### Python Example

```python
async def create_chat_files(
    user_id: int,
    chat_id: int,
    message_id: int,
    files: List[FileInput],
    session_cookie: str
) -> MultipleFilesResponse:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"https://neptun-webui.vercel.app/api/users/{user_id}/chats/{chat_id}/files/{message_id}",
            json={"files": [file.dict() for file in files]},
            cookies={"neptun-session": session_cookie}
        )
        response.raise_for_status()
        return MultipleFilesResponse(**response.json())
```

### TypeScript/JavaScript Example

```typescript
async function createChatFiles(
  userId: number,
  chatId: number,
  messageId: number,
  files: FileInput[]
): Promise<MultipleFilesResponse> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}/chats/${chatId}/files/${messageId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for cookie handling
      body: JSON.stringify({ files }),
    }
  )

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return await response.json() as MultipleFilesResponse
}
```

## Notes

- The session cookie is required for authentication
- The chat and message must belong to the specified user
- Both single file and batch file creation are supported
- The language field should match supported programming languages
- File content is stored as text, suitable for code files
- All timestamps are returned in ISO 8601 format
- The message must exist before files can be attached to it
- File names should include appropriate extensions
- Maximum file size and content length limits may apply
