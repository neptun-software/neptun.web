# Huggingface Chat Endpoint

## Overview

This endpoint provides access to Huggingface's AI models for chat completion with streaming responses.

## Request Details

### HTTP Method

POST

### Route

`/api/ai/huggingface/{model_publisher}/{model_name}/chat`

### Route Parameters

| Parameter       | Type   | Required | Description                   |
| --------------- | ------ | -------- | ----------------------------- |
| model_publisher | string | Yes      | The publisher of the AI model |
| model_name      | string | Yes      | The name of the AI model      |

### Query Parameters

| Parameter | Type    | Required | Description                   |
| --------- | ------- | -------- | ----------------------------- |
| chat_id   | integer | Yes      | Unique identifier of the chat |

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
  "statusMessage": "Invalid model name or publisher"
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

interface ModelConfiguration {
  publisher: string
  name: string
  description: string
  icon: string
  type: 'instruct' | 'chat'
  configuration: (inputs: string) => {
    inputs: string
    model: string
    max_new_tokens?: number
    typical_p?: number
    repetition_penalty?: number
    truncate?: number
    return_full_text?: boolean
    parameters: {
      max_new_tokens: number
      typical_p: number
      repetition_penalty: number
      truncate: number
      return_full_text: boolean
    }
  }
}

enum AllowedAiModelPublishersEnum {
  OpenAssistant = 'OpenAssistant',
  Mistral = 'mistralai',
  metaLlama = 'meta-llama'
}

enum AllowedAiModelNamesEnum {
  OpenAssistant = 'oasst-sft-4-pythia-12b-epoch-3.5',
  Mistral = 'Mistral-7B-Instruct-v0.1',
  metaLlama = 'Meta-Llama-3-8B-Instruct'
}

enum AllowedAiModelsEnum {
  OpenAssistant = 'OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5',
  Mistral = 'mistralai/Mistral-7B-Instruct-v0.1',
  metaLlama = 'meta-llama/Meta-Llama-3-8B-Instruct'
}

type AllowedAiModels = `${AllowedAiModelsEnum}`
type AllowedAiModelPaths = `/api/ai/huggingface/${AllowedAiModels}/chat`
```

### Python Model

```python
from pydantic import BaseModel
from typing import List, Literal, Optional, Dict, Union
from enum import Enum

class Message(BaseModel):
    role: Literal['user', 'assistant']
    content: str
    isStreaming: Optional[bool] = None

class ChatRequest(BaseModel):
    messages: List[Message]

class ModelParameters(BaseModel):
    max_new_tokens: int
    typical_p: float
    repetition_penalty: float
    truncate: int
    return_full_text: bool

class ModelConfiguration(BaseModel):
    publisher: str
    name: str
    description: str
    icon: str
    type: Literal['instruct', 'chat']
    inputs: str
    model: str
    max_new_tokens: Optional[int] = None
    typical_p: Optional[float] = None
    repetition_penalty: Optional[float] = None
    truncate: Optional[int] = None
    return_full_text: Optional[bool] = None
    parameters: ModelParameters

class AllowedAiModelPublishers(str, Enum):
    OpenAssistant = 'OpenAssistant'
    Mistral = 'mistralai'
    metaLlama = 'meta-llama'

class AllowedAiModelNames(str, Enum):
    OpenAssistant = 'oasst-sft-4-pythia-12b-epoch-3.5'
    Mistral = 'Mistral-7B-Instruct-v0.1'
    metaLlama = 'Meta-Llama-3-8B-Instruct'

class AllowedAiModels(str, Enum):
    OpenAssistant = 'OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5'
    Mistral = 'mistralai/Mistral-7B-Instruct-v0.1'
    metaLlama = 'meta-llama/Meta-Llama-3-8B-Instruct'
```

## Code Examples

### cURL Example

```bash
curl -X POST "https://neptun-webui.vercel.app/api/ai/huggingface/meta/llama/chat?chat_id=123" \
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
    model_publisher: str,
    model_name: str,
    messages: List[Message]
) -> None:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"https://neptun-webui.vercel.app/api/ai/huggingface/{model_publisher}/{model_name}/chat",
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
  modelPublisher: string,
  modelName: string,
  messages: Message[]
): Promise<void> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/ai/huggingface/${modelPublisher}/${modelName}/chat?chat_id=${chatId}`,
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
- Both model_publisher and model_name must be valid and available
