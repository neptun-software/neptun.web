# Models API Endpoint

## Overview

This endpoint provides information about available AI models and their configurations.

## Request Details

### HTTP Method

GET

### Route

`/models`

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

| Field                                                                              | Type    | Description                                                |
| ---------------------------------------------------------------------------------- | ------- | ---------------------------------------------------------- |
| configurations                                                                     | Object  | Contains model configurations grouped by publisher         |
| configurations.[publisher]                                                         | Object  | Object containing models for a specific publisher          |
| configurations.[publisher].[modelName]                                             | Object  | Configuration details for a specific model                 |
| configurations.[publisher].[modelName].name                                        | String  | Name of the model                                          |
| configurations.[publisher].[modelName].publisher                                   | String  | Publisher of the model                                     |
| configurations.[publisher].[modelName].description                                 | String  | Description of the model                                   |
| configurations.[publisher].[modelName].icon                                        | String  | Icon identifier for the model                              |
| configurations.[publisher].[modelName].type                                        | String  | Type of model ('instruct' or 'chat')                       |
| configurations.[publisher].[modelName].configuration                               | Object  | Model configuration parameters                             |
| configurations.[publisher].[modelName].configuration.model                         | String  | The model identifier                                       |
| configurations.[publisher].[modelName].configuration.parameters                    | Object  | Model-specific parameters                                  |
| configurations.[publisher].[modelName].configuration.parameters.max_new_tokens     | Integer | Maximum number of tokens to generate                       |
| configurations.[publisher].[modelName].configuration.parameters.typical_p          | Number  | Typical probability (-1 means using provider defaults)     |
| configurations.[publisher].[modelName].configuration.parameters.repetition_penalty | Number  | Penalty for repetition (-1 means using provider defaults)  |
| configurations.[publisher].[modelName].configuration.parameters.truncate           | Integer | Maximum context length for truncation                      |
| configurations.[publisher].[modelName].configuration.parameters.return_full_text   | Boolean | Whether to return the full text including prompt           |
| configurations.[publisher].[modelName].configuration.parameters.temperature        | Number  | Optional: Temperature for sampling (higher = more random)  |
| models                                                                             | Array   | List of all allowed models in "publisher/modelName" format |
| endpoints                                                                          | Object  | Available API endpoints grouped by endpoint category       |
| endpoints.huggingface                                                              | Array   | List of huggingface API endpoints                          |
| endpoints.cloudflare                                                               | Array   | List of cloudflare API endpoints                           |
| endpoints.openrouter                                                               | Array   | List of openrouter API endpoints                           |
| endpoints.ollama                                                                   | Array   | List of ollama API endpoints                               |

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
export interface ModelParameters {
  max_new_tokens: number
  typical_p: number // Can be -1 for some models meaning it is using defaults of the providers
  repetition_penalty: number // Can be -1 for some models meaning it is using defaults of the providers
  truncate: number
  return_full_text: boolean
  temperature?: number
}

export interface ModelConfiguration {
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

export interface ModelsResponse {
  configurations: {
    [publisher: string]: {
      [modelName: string]: ModelConfiguration
    }
  }
  models: string[]
  endpoints: {
    huggingface: string[]
    cloudflare: string[]
    openrouter: string[]
    ollama: string[]
  }
}
```

### Python Model

```python
from typing import Dict, List, Optional, Literal, TypedDict
from pydantic import BaseModel, Field, ConfigDict

class ModelParameters(BaseModel):
    model_config = ConfigDict(extra='forbid')

    max_new_tokens: int
    typical_p: float = Field(description="Can be -1 for some models meaning it is using defaults of the providers")
    repetition_penalty: float = Field(description="Can be -1 for some models meaning it is using defaults of the providers")
    truncate: int
    return_full_text: bool
    temperature: Optional[float] = None

class ModelConfigurationData(BaseModel):
    model_config = ConfigDict(extra='forbid')

    model: str
    parameters: ModelParameters

class ModelConfiguration(BaseModel):
    model_config = ConfigDict(extra='forbid')

    publisher: str
    name: str
    description: str
    icon: str
    type: Literal['instruct', 'chat']
    configuration: ModelConfigurationData

class Endpoints(TypedDict):
    huggingface: List[str]
    cloudflare: List[str]
    openrouter: List[str]
    ollama: List[str]

class ModelsResponse(BaseModel):
    model_config = ConfigDict(extra='forbid')

    configurations: Dict[str, Dict[str, ModelConfiguration]]
    models: List[str]
    endpoints: Endpoints
```

### Example JSON Response

```json
{
  "configurations": {
    "qwen": {
      "Qwen2.5-72B-Instruct": {
        "publisher": "qwen",
        "name": "Qwen2.5-72B-Instruct",
        "description": "<strong>Qwen2.5 is a state-of-the-art large language model from Alibaba Cloud</strong><br>\n72.7B parameters with 80 layers and 64 attention heads for queries.<br>\nExcels at instruction following, long text generation, and structured data handling.<br>\n(Qwen License)",
        "icon": "simple-icons:alibabadotcom",
        "type": "instruct",
        "configuration": {
          "model": "Qwen/Qwen2.5-72B-Instruct",
          "parameters": {
            "max_new_tokens": 512,
            "typical_p": 0.2,
            "repetition_penalty": 1.1,
            "truncate": 32267,
            "return_full_text": false
          }
        }
      },
      "Qwen2.5-Coder-32B-Instruct": {
        "publisher": "qwen",
        "name": "Qwen2.5-Coder-32B-Instruct",
        "description": "<strong>Qwen2.5-Coder is a state-of-the-art code-specific model from Alibaba Cloud</strong><br>\nBuilt on Qwen2.5 with 5.5 trillion tokens of code-focused training data.<br>\nExcels in code generation, reasoning, and fixing with 131K token context support.<br>\n(Apache-2.0 License)",
        "icon": "simple-icons:alibabadotcom",
        "type": "instruct",
        "configuration": {
          "model": "Qwen/Qwen2.5-Coder-32B-Instruct",
          "parameters": {
            "max_new_tokens": 512,
            "typical_p": 0.2,
            "repetition_penalty": 1.1,
            "truncate": 15499,
            "return_full_text": false
          }
        }
      }
    },
    "deepseek-ai": {
      "DeepSeek-R1-Distill-Qwen-32B": {
        "publisher": "deepseek-ai",
        "name": "DeepSeek-R1-Distill-Qwen-32B",
        "description": "SLOWEST MODEL! (high demand)<br><strong>DeepSeek R1 Distill is a powerful model distilled from DeepSeek-R1</strong><br>\nExcels at math, code, and reasoning tasks with performance close to OpenAI o1-mini.<br>\nBased on Qwen2.5 with enhanced reasoning capabilities through distillation.<br>\n(MIT License)",
        "icon": "game-icons:angler-fish",
        "type": "instruct",
        "configuration": {
          "model": "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B",
          "parameters": {
            "max_new_tokens": 512,
            "typical_p": 0.2,
            "repetition_penalty": 1.1,
            "temperature": 0.6,
            "truncate": 12499,
            "return_full_text": false
          }
        }
      }
    },
    "mistralai": {
      "Mistral-Nemo-Instruct-2407": {
        "publisher": "mistralai",
        "name": "Mistral-Nemo-Instruct-2407",
        "description": "<strong>Mistral Nemo is a powerful model jointly trained by Mistral AI and NVIDIA</strong><br>\n40-layer transformer with 5,120 hidden dimensions and 32 attention heads.<br>\nExcels at multilingual tasks with strong performance across 9 languages.<br>\n(Apache-2.0 License)",
        "icon": "game-icons:hummingbird",
        "type": "instruct",
        "configuration": {
          "model": "mistralai/Mistral-Nemo-Instruct-2407",
          "parameters": {
            "max_new_tokens": 500,
            "typical_p": 0.2,
            "repetition_penalty": 1.1,
            "temperature": 0.35,
            "truncate": 127500,
            "return_full_text": false
          }
        }
      },
      "Mistral-7B-Instruct-v0.3": {
        "publisher": "mistralai",
        "name": "Mistral-7B-Instruct-v0.3",
        "description": "<strong>Latest version of Mistral's 7B instruction model with enhanced capabilities</strong><br>\nExtended 32K vocabulary, supports function calling, and uses v3 Tokenizer.<br>\nHighly efficient open-weights model with strong instruction following.<br>\n(Apache-2.0 License)",
        "icon": "game-icons:hummingbird",
        "type": "instruct",
        "configuration": {
          "model": "mistralai/Mistral-7B-Instruct-v0.3",
          "parameters": {
            "max_new_tokens": 500,
            "typical_p": 0.2,
            "repetition_penalty": 1.1,
            "truncate": 32268,
            "return_full_text": false
          }
        }
      }
    },
    "google": {
      "gemma-2-27b-it": {
        "publisher": "google",
        "name": "gemma-2-27b-it",
        "description": "<strong>Gemma is a family of lightweight, state-of-the-art open models from Google</strong><br>\nBuilt from the same research and technology used to create the Gemini models.<br>\nWell-suited for text generation tasks including question answering, summarization, and reasoning.<br>\n(Apache-2.0 License)",
        "icon": "simple-icons:google",
        "type": "instruct",
        "configuration": {
          "model": "google/gemma-2-27b-it",
          "parameters": {
            "max_new_tokens": 500,
            "typical_p": 0.2,
            "repetition_penalty": 1.1,
            "truncate": 7692,
            "return_full_text": false
          }
        }
      }
    },
    "openrouter": {
      "gemini-2.0-pro-exp-02-05": {
        "publisher": "openrouter",
        "name": "gemini-2.0-pro-exp-02-05",
        "description": "<strong>Google's Gemini 2.0 Pro Experimental Model</strong><br>\nLatest experimental version of Gemini with enhanced capabilities.<br>\nExcellent at reasoning, coding, and creative tasks.",
        "icon": "simple-icons:google",
        "type": "chat",
        "configuration": {
          "model": "google/gemini-2.0-pro-exp-02-05:free",
          "parameters": {
            "max_new_tokens": 8192,
            "typical_p": -1,
            "repetition_penalty": -1,
            "truncate": 1991808,
            "return_full_text": false
          }
        }
      },
      "deepseek-chat": {
        "publisher": "openrouter",
        "name": "deepseek-chat",
        "description": "<strong>DeepSeek's Chat Model</strong><br>\nPowerful model optimized for natural conversations and reasoning.<br>\nStrong performance across various tasks including coding.",
        "icon": "game-icons:angler-fish",
        "type": "chat",
        "configuration": {
          "model": "deepseek/deepseek-chat:free",
          "parameters": {
            "max_new_tokens": 128000,
            "typical_p": -1,
            "repetition_penalty": -1,
            "truncate": 128000,
            "return_full_text": false
          }
        }
      },
      "llama-3.3-70b-instruct": {
        "publisher": "openrouter",
        "name": "llama-3.3-70b-instruct",
        "description": "<strong>Meta's Llama 3.3 70B Instruct Model</strong><br>\nLatest version of Llama optimized for instruction following.<br>\nExcellent performance across multiple languages and tasks.",
        "icon": "simple-icons:meta",
        "type": "chat",
        "configuration": {
          "model": "meta-llama/llama-3.3-70b-instruct:free",
          "parameters": {
            "max_new_tokens": 2048,
            "typical_p": -1,
            "repetition_penalty": -1,
            "truncate": 129024,
            "return_full_text": false
          }
        }
      }
    },
    "cloudflare": {
      "llama-3.3-70b-instruct-fp8-fast": {
        "publisher": "cloudflare",
        "name": "llama-3.3-70b-instruct-fp8-fast",
        "description": "<strong>Llama 3.3 70B quantized to fp8 precision, optimized to be faster</strong><br>\nPowerful model with 70B parameters optimized for instruction following.<br>\nExcels at text generation, reasoning, and structured data handling.<br>\n(Llama 3.3 Community License)",
        "icon": "simple-icons:cloudflare",
        "type": "instruct",
        "configuration": {
          "model": "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
          "parameters": {
            "max_new_tokens": 256,
            "typical_p": 0.2,
            "repetition_penalty": 1.1,
            "truncate": 130816,
            "return_full_text": false
          }
        }
      }
    },
    "microsoft": {
      "Phi-3-mini-4k-instruct": {
        "publisher": "microsoft",
        "name": "Phi-3-mini-4k-instruct",
        "description": "<strong>Phi-3 Mini is a 3.8B parameter, lightweight, state-of-the-art open model from Microsoft</strong><br>\nTrained with high-quality datasets focused on reasoning and instruction following.<br>\nExcellent performance for math, coding, and logical reasoning tasks.<br>\n(MIT License)",
        "icon": "simple-icons:microsoft",
        "type": "instruct",
        "configuration": {
          "model": "microsoft/Phi-3-mini-4k-instruct",
          "parameters": {
            "max_new_tokens": 500,
            "typical_p": 0.2,
            "repetition_penalty": 1.1,
            "truncate": 3596,
            "return_full_text": false
          }
        }
      }
    },
    "ollama": {
      "rwkv-6-world": {
        "publisher": "ollama",
        "name": "rwkv-6-world",
        "description": "<strong>RWKV-6-World is an efficient 1.6B parameter model</strong><br>\nTrained on diverse datasets with strong performance in 12 languages.<br>\nEfficient architecture combining RNN and transformer-like capabilities.<br>\n(Apache-2.0 License)",
        "icon": "simple-icons:ollama",
        "type": "instruct",
        "configuration": {
          "model": "mollysama/rwkv-6-world:1.6b",
          "parameters": {
            "max_new_tokens": 500,
            "typical_p": -1,
            "repetition_penalty": -1,
            "truncate": 3596,
            "return_full_text": false
          }
        }
      }
    }
  },
  "models": [
    "google/gemma-2-27b-it",
    "qwen/Qwen2.5-72B-Instruct",
    "qwen/Qwen2.5-Coder-32B-Instruct",
    "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B",
    "mistralai/Mistral-Nemo-Instruct-2407",
    "mistralai/Mistral-7B-Instruct-v0.3",
    "microsoft/Phi-3-mini-4k-instruct",
    "cloudflare/llama-3.3-70b-instruct-fp8-fast",
    "openrouter/gemini-2.0-pro-exp-02-05",
    "openrouter/deepseek-chat",
    "openrouter/llama-3.3-70b-instruct",
    "ollama/rwkv-6-world"
  ],
  "endpoints": {
    "huggingface": [
      "/api/ai/huggingface/gemma-2-27b-it/chat",
      "/api/ai/huggingface/Qwen2.5-72B-Instruct/chat",
      "/api/ai/huggingface/Qwen2.5-Coder-32B-Instruct/chat",
      "/api/ai/huggingface/DeepSeek-R1-Distill-Qwen-32B/chat",
      "/api/ai/huggingface/Mistral-Nemo-Instruct-2407/chat",
      "/api/ai/huggingface/Mistral-7B-Instruct-v0.3/chat",
      "/api/ai/huggingface/Phi-3-mini-4k-instruct/chat"
    ],
    "cloudflare": [
      "/api/ai/cloudflare/llama-3.3-70b-instruct-fp8-fast/chat"
    ],
    "openrouter": [
      "/api/ai/openrouter/gemini-2.0-pro-exp-02-05/chat",
      "/api/ai/openrouter/deepseek-chat/chat",
      "/api/ai/openrouter/llama-3.3-70b-instruct/chat"
    ],
    "ollama": [
      "/api/ai/ollama/rwkv-6-world/chat"
    ]
  }
}
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
from typing import List

async def get_models() -> ModelsResponse:
    """
    Fetches AI model configurations, allowed models, and API endpoints.

    Returns:
        ModelsResponse object containing:
        - configurations: Model configurations grouped by publisher
        - models: List of all allowed models
        - endpoints: Available API endpoints grouped by category
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://neptun-webui.vercel.app/api/models",
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        return ModelsResponse.model_validate(response.json())

async def list_openrouter_endpoints() -> List[str]:
    models_data = await get_models()
    return models_data.endpoints["openrouter"]
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

async function listOpenRouterEndpoints(): Promise<string[]> {
  const modelsData = await getModels()
  return modelsData.endpoints.openrouter
}
```
