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

### Response Status Codes

| Status Code | Description                          |
| ----------- | ------------------------------------ |
| 200         | Server is healthy and responding     |
| 500         | Server encountered an internal error |
| 503         | Server is temporarily unavailable    |

### Success Response (200 OK)

#### Response Structure

The endpoint returns a JSON object with the following properties:

| Field     | Type   | Description                                  |
| --------- | ------ | -------------------------------------------- |
| status    | string | Current health status of the server          |
| timestamp | string | ISO 8601 formatted timestamp of the response |
| uptime    | double | Server uptime in seconds                     |

### Error Response

#### 500 Internal Server Error

```json
{
  "status": "error",
  "timestamp": "2024-03-20T10:30:45.123Z",
  "error": "Internal server error occurred"
}
```

#### 503 Service Unavailable

```json
{
  "status": "unavailable",
  "timestamp": "2024-03-20T10:30:45.123Z",
  "error": "Service temporarily unavailable"
}
```

### TypeScript Interface

```typescript
interface HealthCheckResponse {
  status: string
  timestamp: string
  uptime: number
}

interface HealthCheckError {
  status: string
  timestamp: string
  error: string
}
```

### Python Model

```python
from pydantic import BaseModel
from datetime import datetime

class HealthCheckResponse(BaseModel):
    status: str
    timestamp: str
    uptime: float

class HealthCheckError(BaseModel):
    status: str
    timestamp: str
    error: str
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

### Python Example

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

### TypeScript/JavaScript Example

```typescript
async function checkHealth(): Promise<HealthCheckResponse> {
  const response = await fetch('https://neptun-webui.vercel.app/health')
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return await response.json() as HealthCheckResponse
}
```

## Notes

- No authentication required
- Response times should be under 100ms
- Status field values: "healthy", "error", "unavailable"
- Timestamp is always in UTC
- Uptime is measured in seconds with millisecond precision
