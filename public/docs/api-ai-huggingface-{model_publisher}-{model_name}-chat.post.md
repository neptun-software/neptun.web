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

enum AllowedAiModelPublishersEnum {
  Qwen = 'qwen',
  DeepSeek = 'deepseek-ai',
  Mistral = 'mistralai',
  Google = 'google',
  Microsoft = 'microsoft'
}

enum AllowedAiModelNamesEnum {
  Qwen72B = 'Qwen2.5-72B-Instruct',
  QwenCoder = 'Qwen2.5-Coder-32B-Instruct',
  DeepSeekR1 = 'DeepSeek-R1-Distill-Qwen-32B',
  MistralNemo = 'Mistral-Nemo-Instruct-2407',
  Mistral7B = 'Mistral-7B-Instruct-v0.3',
  Gemma = 'gemma-2-27b-it',
  Phi3 = 'Phi-3-mini-4k-instruct'
}

enum AllowedAiModelsEnum {
  Qwen72B = 'qwen/Qwen2.5-72B-Instruct',
  QwenCoder = 'qwen/Qwen2.5-Coder-32B-Instruct',
  DeepSeekR1 = 'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B',
  MistralNemo = 'mistralai/Mistral-Nemo-Instruct-2407',
  Mistral7B = 'mistralai/Mistral-7B-Instruct-v0.3',
  Gemma = 'google/gemma-2-27b-it',
  Phi3 = 'microsoft/Phi-3-mini-4k-instruct'
}

type AllowedAiModels = `${AllowedAiModelsEnum}`
type AllowedAiModelPaths = `/api/ai/huggingface/${AllowedAiModels}/chat`
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

class AllowedAiModelPublishers(str, Enum):
    Qwen = 'qwen'
    DeepSeek = 'deepseek-ai'
    Mistral = 'mistralai'
    Google = 'google'
    Microsoft = 'microsoft'

class AllowedAiModelNames(str, Enum):
    Qwen72B = 'Qwen2.5-72B-Instruct'
    QwenCoder = 'Qwen2.5-Coder-32B-Instruct'
    DeepSeekR1 = 'DeepSeek-R1-Distill-Qwen-32B'
    MistralNemo = 'Mistral-Nemo-Instruct-2407'
    Mistral7B = 'Mistral-7B-Instruct-v0.3'
    Gemma = 'gemma-2-27b-it'
    Phi3 = 'Phi-3-mini-4k-instruct'

class AllowedAiModels(str, Enum):
    Qwen72B = 'qwen/Qwen2.5-72B-Instruct'
    QwenCoder = 'qwen/Qwen2.5-Coder-32B-Instruct'
    DeepSeekR1 = 'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B'
    MistralNemo = 'mistralai/Mistral-Nemo-Instruct-2407'
    Mistral7B = 'mistralai/Mistral-7B-Instruct-v0.3'
    Gemma = 'google/gemma-2-27b-it'
    Phi3 = 'microsoft/Phi-3-mini-4k-instruct'
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
