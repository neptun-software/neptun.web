# AI Model Router Endpoint

## Overview

This endpoint serves as a central router for AI model chat completions, supporting multiple model providers including Cloudflare, HuggingFace-hosted models (Qwen, DeepSeek, Mistral, Google, Microsoft), OpenRouter, and Ollama (self-hosted).

## Request Details

### HTTP Method

POST

### Route

`/api/ai/[model_publisher]/[model_name]/chat`

### Route Parameters

| Parameter       | Type   | Required | Description              |
| --------------- | ------ | -------- | ------------------------ |
| model_publisher | string | Yes      | The AI model provider    |
| model_name      | string | Yes      | The name of the AI model |

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
| 400         | Bad Request - Invalid parameters       |
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

#### Invalid Parameters (400 Bad Request)

```json
{
  "statusCode": 400,
  "statusMessage": "Invalid model publisher or model name"
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
  configuration: (inputs: string) => {
    model: string
    inputs: string
    parameters: {
      max_new_tokens: number
      typical_p: number
      repetition_penalty: number
      truncate: number
      return_full_text: boolean
      temperature?: number
    }
  }
}

interface PossibleAiModels {
  [key: string]: {
    [model: string]: ModelConfiguration
  }
}

const allowedModelsConst = [
  'google/gemma-2-27b-it',
  'qwen/Qwen2.5-72B-Instruct',
  'qwen/Qwen2.5-Coder-32B-Instruct',
  'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B',
  'mistralai/Mistral-Nemo-Instruct-2407',
  'mistralai/Mistral-7B-Instruct-v0.3',
  'microsoft/Phi-3-mini-4k-instruct',
  'cloudflare/llama-3.3-70b-instruct-fp8-fast',
  'openrouter/gemini-2.0-pro-exp-02-05',
  'openrouter/deepseek-chat',
  'openrouter/llama-3.3-70b-instruct',
  'ollama/rwkv-6-world',
] as const

type AllowedAiModels = `${(typeof allowedModelsConst)[number]}`

enum AllowedAiModelPublishersEnum {
  Qwen = 'qwen',
  DeepSeek = 'deepseek-ai',
  Mistral = 'mistralai',
  Google = 'google',
  Microsoft = 'microsoft',
  Cloudflare = 'cloudflare',
  OpenRouter = 'openrouter',
  Ollama = 'ollama'
}

enum AllowedAiModelNamesEnum {
  Qwen72B = 'Qwen2.5-72B-Instruct',
  QwenCoder = 'Qwen2.5-Coder-32B-Instruct',
  DeepSeekR1 = 'DeepSeek-R1-Distill-Qwen-32B',
  MistralNemo = 'Mistral-Nemo-Instruct-2407',
  Mistral7B = 'Mistral-7B-Instruct-v0.3',
  Gemma = 'gemma-2-27b-it',
  Phi3 = 'Phi-3-mini-4k-instruct',
  CloudflareLlama = 'llama-3.3-70b-instruct-fp8-fast',
  OpenRouterGemini = 'gemini-2.0-pro-exp-02-05',
  OpenRouterDeepseek = 'deepseek-chat',
  OpenRouterLlama33 = 'llama-3.3-70b-instruct',
  RwkvWorld = 'rwkv-6-world'
}
```

### Python Model

```python
from pydantic import BaseModel, Field
from typing import List, Literal, Optional, Union, Callable, Dict, TypeVar
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

class ConfigurationReturn(BaseModel):
    model: str
    inputs: str
    parameters: ModelParameters

class ModelConfiguration(BaseModel):
    publisher: str
    name: str
    description: str
    icon: str
    type: Literal['instruct', 'chat']
    configuration: Callable[[str], ConfigurationReturn]

T = TypeVar('T')
class PossibleAiModels(Dict[str, Dict[str, ModelConfiguration]]):
    pass

ALLOWED_MODELS_CONST = [
    'google/gemma-2-27b-it',
    'qwen/Qwen2.5-72B-Instruct',
    'qwen/Qwen2.5-Coder-32B-Instruct',
    'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B',
    'mistralai/Mistral-Nemo-Instruct-2407',
    'mistralai/Mistral-7B-Instruct-v0.3',
    'microsoft/Phi-3-mini-4k-instruct',
    'cloudflare/llama-3.3-70b-instruct-fp8-fast',
    'openrouter/gemini-2.0-pro-exp-02-05',
    'openrouter/deepseek-chat',
    'openrouter/llama-3.3-70b-instruct',
    'ollama/rwkv-6-world',
]

class AllowedAiModelPublishers(str, Enum):
    Qwen = 'qwen'
    DeepSeek = 'deepseek-ai'
    Mistral = 'mistralai'
    Google = 'google'
    Microsoft = 'microsoft'
    Cloudflare = 'cloudflare'
    OpenRouter = 'openrouter'
    Ollama = 'ollama'

class AllowedAiModelNames(str, Enum):
    Qwen72B = 'Qwen2.5-72B-Instruct'
    QwenCoder = 'Qwen2.5-Coder-32B-Instruct'
    DeepSeekR1 = 'DeepSeek-R1-Distill-Qwen-32B'
    MistralNemo = 'Mistral-Nemo-Instruct-2407'
    Mistral7B = 'Mistral-7B-Instruct-v0.3'
    Gemma = 'gemma-2-27b-it'
    Phi3 = 'Phi-3-mini-4k-instruct'
    CloudflareLlama = 'llama-3.3-70b-instruct-fp8-fast'
    OpenRouterGemini = 'gemini-2.0-pro-exp-02-05'
    OpenRouterDeepseek = 'deepseek-chat'
    OpenRouterLlama33 = 'llama-3.3-70b-instruct'
    RwkvWorld = 'rwkv-6-world'
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
import asyncio
from typing import List
from pydantic import BaseModel

async def stream_chat_completion(
    session_cookie: str,
    chat_id: int,
    model_publisher: str,
    model_name: str,
    messages: List[Message]
) -> None:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"https://neptun-webui.vercel.app/api/ai/{model_publisher}/{model_name}/chat",
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

# Example usage
async def main():
    messages = [
        Message(role="user", content="Hello, how are you?")
    ]
    await stream_chat_completion(
        session_cookie="your-session-cookie",
        chat_id=123,
        model_publisher="cloudflare",
        model_name="llama-3.3-70b-instruct-fp8-fast",
        messages=messages
    )

if __name__ == "__main__":
    asyncio.run(main())
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
    `https://neptun-webui.vercel.app/api/ai/${modelPublisher}/${modelName}/chat?chat_id=${chatId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
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
    console.log(new TextDecoder().decode(value))
  }
}
```

## Notes

- The endpoint provides streaming responses for all supported models
- Authentication is required via the neptun-session cookie
- The chat_id must be a valid integer corresponding to an existing chat
- The response is streamed in chunks as the AI model generates the reply
- Supported model publishers and their models:
  - Cloudflare
    - Llama 3.3 70B Instruct FP8 Fast
  - HuggingFace-hosted models:
    - Qwen (72B Instruct, Coder 32B)
    - DeepSeek (R1 Distill Qwen 32B)
    - Mistral (Nemo Instruct, 7B Instruct v0.3)
    - Google (Gemma 2 27B)
    - Microsoft (Phi-3 Mini 4K)
  - OpenRouter
    - Gemini 2.0 Pro Experimental
    - DeepSeek Chat
    - Llama 3.3 70B Instruct
  - Ollama
    - RWKV 6 World
- Each model has specific configuration parameters and context length limits
- The endpoint automatically routes requests to the appropriate provider endpoint based on the model publisher
