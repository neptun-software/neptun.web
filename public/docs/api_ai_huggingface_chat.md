# Huggingface Chat Endpoint

## Overview

This endpoint provides access to Huggingface's AI models for chat completion with streaming responses.

## Request Details

### HTTP Method

POST

### Route

`/api/ai/huggingface/{model_publisher}/{model_name}/chat`

### Route Parameters

| Parameter        | Type   | Required | Description                          |
|-----------------|--------|----------|--------------------------------------|
| model_publisher | string | Yes      | The publisher of the AI model        |
| model_name      | string | Yes      | The name of the AI model            |

### Query Parameters

| Parameter | Type   | Required | Description                    |
|-----------|--------|----------|--------------------------------|
| chat_id   | string | Yes      | Unique identifier of the chat  |

### Headers

| Header         | Value            | Required | Description                    |
|----------------|------------------|----------|--------------------------------|
| Content-Type   | application/json | Yes      | Indicates JSON request body    |
| Authorization  | Bearer {token}   | Yes      | JWT authentication token      |

### Request Body

The request body should contain the chat messages array.

| Field    | Type     | Required | Description                                |
|----------|----------|----------|--------------------------------------------|
| messages | Message[] | Yes      | Array of chat messages                    |

#### TypeScript Interface

```typescript
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: Message[];
}
```

#### Python Model

```python
from pydantic import BaseModel
from typing import List, Literal

class Message(BaseModel):
    role: Literal['user', 'assistant']
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
```

## Response Format

### Success Response

The response is a streaming text response containing the AI model's reply.

#### Response Headers

| Header              | Value                        | Description                    |
|--------------------|------------------------------|--------------------------------|
| Content-Type       | text/event-stream            | Indicates streaming response   |
| Transfer-Encoding  | chunked                      | Indicates chunked transfer     |

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

## Code Examples

### Python Example (using httpx)

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
    token: str,
    chat_id: str,
    model_publisher: str,
    model_name: str,
    messages: List[Message]
) -> None:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"https://neptun-webui.vercel.app/api/ai/huggingface/{model_publisher}/{model_name}/chat",
            params={"chat_id": chat_id},
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            },
            json={"messages": [msg.dict() for msg in messages]},
            timeout=None
        )
        response.raise_for_status()
        
        async for chunk in response.aiter_bytes():
            print(chunk.decode(), end="", flush=True)
```

### cURL Example

```bash
curl -X POST "https://neptun-webui.vercel.app/api/ai/huggingface/meta/llama/chat?chat_id=123" \
  -H "Authorization: Bearer your-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello, how are you?"}
    ]
  }'
```

### TypeScript/JavaScript Example (using fetch)

```typescript
async function streamChatCompletion(
  token: string,
  chatId: string,
  modelPublisher: string,
  modelName: string,
  messages: Message[]
): Promise<void> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/ai/huggingface/${modelPublisher}/${modelName}/chat?chat_id=${chatId}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) return;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    // Process the streaming response chunks
    console.log(new TextDecoder().decode(value));
  }
}
```
