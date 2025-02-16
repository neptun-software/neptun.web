# Models API Endpoint

## Overview

This endpoint provides information about available AI models and their configurations.

## Request Details

### HTTP Method

GET

### Route

`GET https://neptun-webui.vercel.app/api/models`

### Route Parameters

This endpoint does not have any route parameters.

### Query Parameters

This endpoint does not accept any query parameters.

### Headers

| Header       | Value            | Required | Description                 |
| ------------ | ---------------- | -------- | --------------------------- |
| Content-Type | application/json | Yes      | Indicates JSON request body |

### Request Body

This endpoint does not require a request body.

## Response Format

### Response Status Codes

| Status Code | Description           |
| ----------- | --------------------- |
| 200         | Success               |
| 500         | Internal Server Error |

### Success Response

The response is a JSON object containing AI model configurations grouped by publisher.

#### Response Headers

| Header       | Value            | Description             |
| ------------ | ---------------- | ----------------------- |
| Content-Type | application/json | Indicates JSON response |

#### Response Fields

| Field                                            | Type   | Description                                       |
| ------------------------------------------------ | ------ | ------------------------------------------------- |
| [publisher]                                      | Object | Object containing models for a specific publisher |
| [publisher].[modelName]                          | Object | Configuration details for a specific model        |
| [publisher].[modelName].name                     | String | Name of the model                                 |
| [publisher].[modelName].configuration            | Object | Model configuration parameters                    |
| [publisher].[modelName].configuration.model      | String | The model identifier                              |
| [publisher].[modelName].configuration.parameters | Object | Model-specific parameters                         |

### Error Responses

#### Internal Server Error (500)

```json
{
  "statusCode": 500,
  "statusMessage": "Internal Server Error"
}
```

### TypeScript Interface

```typescript
export interface ModelConfiguration {
  publisher: string
  name: string
  description: string
  icon: string
  type: 'instruct' | 'chat'
  configuration: {
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

interface ModelsResponse {
  [publisher: string]: {
    [modelName: string]: ModelConfiguration
  }
}
```

### Python Model

```python
from typing import Dict, Any, Callable, TypedDict, Literal
from pydantic import BaseModel

class ModelParameters(TypedDict):
    max_new_tokens: int
    typical_p: float
    repetition_penalty: float
    truncate: int
    return_full_text: bool

class ModelConfigurationResult(TypedDict):
    inputs: str
    model: str
    max_new_tokens: int | None
    typical_p: float | None
    repetition_penalty: float | None
    truncate: int | None
    return_full_text: bool | None
    parameters: ModelParameters

class ModelConfiguration(BaseModel):
    publisher: str
    name: str
    description: str
    icon: str
    type: Literal['instruct', 'chat']
    configuration: Callable[[str], ModelConfigurationResult]

class PublisherModels(BaseModel):
    __root__: Dict[str, ModelConfiguration]

class ModelsResponse(BaseModel):
    __root__: Dict[str, PublisherModels]
```

## Code Examples

### cURL Example

```bash
curl -X GET \
  https://neptun-webui.vercel.app/api/models \
  -H 'Content-Type: application/json'
```

### Python Example

```python
import httpx
from pydantic import BaseModel
from typing import Dict, Any

async def get_models() -> Dict[str, Any]:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://neptun-webui.vercel.app/api/models",
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        return response.json()
```

### TypeScript Example

```typescript
async function getModels(): Promise<ModelsResponse> {
  const response = await fetch('https://neptun-webui.vercel.app/api/models', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return await response.json()
}
```
