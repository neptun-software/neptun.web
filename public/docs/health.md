# Health Check Endpoint

## Overview

This endpoint provides basic health check information about the server.

## Request Details

### HTTP Method

GET

### Route

`/health`

### Headers

No specific headers required.

### Query Parameters

No query parameters required.

### Request Body

No request body required.

## Response Format

### Success Response (200 OK)

#### Response Structure

The endpoint returns a JSON object with the following properties:

| Field     | Type   | Description                                     |
|-----------|--------|-------------------------------------------------|
| status    | string | Current health status of the server             |
| timestamp | string | ISO 8601 formatted timestamp of the response    |
| uptime    | number | Server uptime in seconds                        |

#### TypeScript Interface

```typescript
interface HealthCheckResponse {
  status: string;
  timestamp: string;
  uptime: number;
}
```

#### Python Model

```python
from pydantic import BaseModel
from datetime import datetime

class HealthCheckResponse(BaseModel):
    status: str
    timestamp: str
    uptime: float
```

### Example Response

```json
{
  "status": "healthy",
  "timestamp": "2024-03-20T10:30:45.123Z",
  "uptime": 3600.45
}
```

## Code Examples

### Python Example (using httpx)

```python
import httpx
from pydantic import BaseModel
from datetime import datetime

class HealthCheckResponse(BaseModel):
    status: str
    timestamp: str
    uptime: float

async def check_health() -> HealthCheckResponse:
    async with httpx.AsyncClient() as client:
        response = await client.get("https://neptun-webui.vercel.app/health")
        response.raise_for_status()
        return HealthCheckResponse(**response.json())
```

### cURL Example

```bash
curl -X GET https://neptun-webui.vercel.app/health
```

### TypeScript/JavaScript Example (using fetch)

```typescript
async function checkHealth(): Promise<HealthCheckResponse> {
  const response = await fetch('https://neptun-webui.vercel.app/health');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json() as HealthCheckResponse;
}
```

## Error Responses

This endpoint typically only returns a 200 OK response. In case of server issues, standard HTTP error codes may be returned:

- 500 Internal Server Error: If the server encounters an error while processing the request
- 503 Service Unavailable: If the server is temporarily unavailable
