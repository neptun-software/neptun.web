# Cloudflare Chat Endpoint

## Overview

This endpoint provides access to Cloudflare's AI models for chat completion with streaming responses.

## Request Details

### HTTP Method

POST

### Route

`/api/ai/cloudflare/{model_name}/chat`

### Route Parameters

| Parameter  | Type   | Required | Description              |
| ---------- | ------ | -------- | ------------------------ |
| model_name | string | Yes      | The name of the AI model |

### Query Parameters

| Parameter     | Type    | Required | Description                                |
| ------------- | ------- | -------- | ------------------------------------------ |
| chat_id       | integer | Yes      | Unique identifier of the chat              |
| is_playground | boolean | No       | Indicates if the conversation is temporary |

### Headers

| Header       | Value            | Required | Description                   |
| ------------ | ---------------- | -------- | ----------------------------- |
| Content-Type | application/json | Yes      | Indicates JSON request body   |
| Cookie       | neptun-session   | Yes      | Session authentication cookie |

### Request Body

The request body should contain the chat messages array.

| Field    | Type      | Required | Description            |
| -------- | --------- | -------- | ---------------------- |
| messages | Message[] | Yes      | Array of chat messages |

## Response Format

### Response Status Codes

| Status Code | Description                            |
| ----------- | -------------------------------------- |
| 200         | Success - Streaming response initiated |
| 400         | Bad Request - Invalid model or service |
| 401         | Unauthorized - Invalid session         |
| 500         | Internal Server Error                  |

### Success Response

The response is a streaming text response containing the AI model's reply.

#### Response Headers

| Header            | Value             | Description                  |
| ----------------- | ----------------- | ---------------------------- |
| Content-Type      | text/event-stream | Indicates streaming response |
| Transfer-Encoding | chunked           | Indicates chunked transfer   |

### Error Responses

#### Invalid Model (400 Bad Request)

```json
{
  "statusCode": 400,
  "statusMessage": "Invalid model name"
}
```

#### Service Unavailable (400 Bad Request)

```json
{
  "statusCode": 400,
  "statusMessage": "Service not available anymore."
}
```

#### Internal Server Error (500)

```json
{
  "statusCode": 500,
  "statusMessage": "Internal Server Error"
}
```

### TypeScript Interface

```typescript
import type { Message as BaseMessage } from '@ai-sdk/vue'

interface Message extends BaseMessage {
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

interface ChatRequest {
  messages: Message[]
}

interface ModelParameters {
  max_new_tokens: number
  typical_p: number // Can be -1 for some models meaning it is using defaults of the providers
  repetition_penalty: number // Can be -1 for some models meaning it is using defaults of the providers
  truncate: number
  return_full_text: boolean
  temperature?: number
}

interface ModelConfiguration {
  publisher: string
  name: string
  description: string
  icon: string
  type: 'instruct' | 'chat'
  configuration: {
    model: string
    parameters: ModelParameters
  }
}

enum AllowedCloudflarePublishersEnum {
  Cloudflare = 'cloudflare'
}

enum AllowedCloudflareModelNamesEnum {
  CloudflareLlama = 'llama-3.3-70b-instruct-fp8-fast'
}

enum AllowedCloudflareModelsEnum {
  CloudflareLlama = 'cloudflare/llama-3.3-70b-instruct-fp8-fast'
}

type AllowedCloudflareModels = `${AllowedCloudflareModelsEnum}`
type AllowedCloudflareModelPaths = `/api/ai/cloudflare/${AllowedCloudflareModelNamesEnum}/chat`
```

### Python Model

```python
from pydantic import BaseModel, Field
from typing import List, Literal, Optional
from enum import Enum

class Message(BaseModel):
    role: Literal['user', 'assistant']
    content: str
    isStreaming: Optional[bool] = None

class ChatRequest(BaseModel):
    messages: List[Message]

class ModelParameters(BaseModel):
    max_new_tokens: int
    typical_p: float = Field(description="Can be -1 for some models meaning it is using defaults of the providers")
    repetition_penalty: float = Field(description="Can be -1 for some models meaning it is using defaults of the providers")
    truncate: int
    return_full_text: bool
    temperature: Optional[float] = None

class ModelConfigurationData(BaseModel):
    model: str
    parameters: ModelParameters

class ModelConfiguration(BaseModel):
    publisher: str
    name: str
    description: str
    icon: str
    type: Literal['instruct', 'chat']
    configuration: ModelConfigurationData

class AllowedCloudflarePublishers(str, Enum):
    Cloudflare = 'cloudflare'

class AllowedCloudflareModelNames(str, Enum):
    CloudflareLlama = 'llama-3.3-70b-instruct-fp8-fast'

class AllowedCloudflareModels(str, Enum):
    CloudflareLlama = 'cloudflare/llama-3.3-70b-instruct-fp8-fast'
```

## Code Examples

### cURL Example

```bash
curl -X POST "https://neptun-webui.vercel.app/api/ai/cloudflare/llama-3.3-70b-instruct-fp8-fast/chat?chat_id=123" \
  -H "Cookie: neptun-session=your-session-cookie" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello, how are you?"}
    ]
  }'
```

### Python Example

```python
import httpx
from pydantic import BaseModel
from typing import List, Literal
import asyncio

class Message(BaseModel):
    role: Literal['user', 'assistant']
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]

async def stream_chat_completion(
    session_cookie: str,
    chat_id: int,
    model_name: str,
    messages: List[Message]
) -> None:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"https://neptun-webui.vercel.app/api/ai/cloudflare/{model_name}/chat",
            params={"chat_id": chat_id},
            cookies={"neptun-session": session_cookie},
            headers={
                "Content-Type": "application/json"
            },
            json={"messages": [msg.dict() for msg in messages]},
            timeout=None
        )
        response.raise_for_status()

        async for chunk in response.aiter_bytes():
            print(chunk.decode(), end="", flush=True)
```

### TypeScript/JavaScript Example

```typescript
async function streamChatCompletion(
  sessionCookie: string,
  chatId: number,
  modelName: string,
  messages: Message[]
): Promise<void> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/ai/cloudflare/${modelName}/chat?chat_id=${chatId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for cookie handling
      body: JSON.stringify({ messages }),
    }
  )

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const reader = response.body?.getReader()
  if (!reader) {
    return
  }

  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }

    // Process the streaming response chunks
    console.log(new TextDecoder().decode(value))
  }
}
```

## Notes

- The endpoint provides streaming responses
- Authentication is required via the neptun-session cookie
- The chat_id must be a valid integer corresponding to an existing chat
- The response is streamed in chunks as the AI model generates the reply
- Only the specified Cloudflare model is available through this endpoint
