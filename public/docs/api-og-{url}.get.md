# Open Graph Data Fetcher Endpoint

## Overview

This endpoint fetches Open Graph (OG) metadata from a given URL. It supports standard Open Graph tags, Twitter Card metadata, and includes caching functionality.

## Request Details

### HTTP Method

GET

### Route

`/api/og/{url}`

### Route Parameters

| Parameter | Type   | Required | Description                                           |
| --------- | ------ | -------- | ----------------------------------------------------- |
| url       | string | Yes      | URL-encoded path to the webpage to fetch OG data from |

### Headers

No specific headers required.

### Query Parameters

No query parameters required.

### Request Body

No request body required.

## Response Format

### Response Status Codes

| Status Code | Description                  |
| ----------- | ---------------------------- |
| 200         | Successfully fetched OG data |
| 400         | Invalid URL                  |
| 500         | Server error during fetch    |

### Success Response (200 OK)

Returns the Open Graph metadata as a JSON object.

#### Example Response

```json
{
  "ogTitle": "Example Page Title",
  "ogDescription": "A description of the page content",
  "ogImage": [
    {
      "url": "https://example.com/image.jpg",
      "type": "image/jpeg",
      "width": "1200",
      "height": "630",
      "alt": "Image description"
    }
  ],
  "ogSiteName": "Example Site",
  "ogType": "website",
  "ogLocale": "en_US",
  "twitterCard": "summary_large_image",
  "twitterTitle": "Example Page Title",
  "twitterDescription": "A description of the page content",
  "twitterImage": [
    {
      "url": "https://example.com/twitter-image.jpg",
      "alt": "Image description"
    }
  ],
  "twitterSite": "@example",
  "favicon": "https://example.com/favicon.ico"
}
```

### Error Responses

#### Bad Request (400)

When the URL is invalid:

```json
{
  "statusCode": 400,
  "statusMessage": "Bad Request",
  "data": "Invalid URL"
}
```

#### Server Error (500)

When the OG data cannot be fetched:

```json
{
  "statusCode": 500,
  "message": "Failed to fetch OG data: Error message"
}
```

### TypeScript Interface

```typescript
interface OgData {
  ogTitle?: string
  ogDescription?: string
  ogImage?: Array<{
    url: string
    type?: string
    width?: string
    height?: string
    alt?: string
  }>
  ogSiteName?: string
  ogType?: string
  ogLocale?: string
  twitterCard?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: Array<{
    url: string
    alt?: string
  }>
  twitterSite?: string
  favicon?: string
}

interface OgError {
  statusCode: number
  message: string
}
```

### Python Model

```python
from typing import List, Optional
from pydantic import BaseModel

class OgImage(BaseModel):
    url: str
    type: Optional[str]
    width: Optional[str]
    height: Optional[str]
    alt: Optional[str]

class TwitterImage(BaseModel):
    url: str
    alt: Optional[str]

class OgData(BaseModel):
    ogTitle: Optional[str]
    ogDescription: Optional[str]
    ogImage: Optional[List[OgImage]]
    ogSiteName: Optional[str]
    ogType: Optional[str]
    ogLocale: Optional[str]
    twitterCard: Optional[str]
    twitterTitle: Optional[str]
    twitterDescription: Optional[str]
    twitterImage: Optional[List[TwitterImage]]
    twitterSite: Optional[str]
    favicon: Optional[str]

class OgError(BaseModel):
    statusCode: int
    message: str
```

## Code Examples

### cURL Example

```bash
curl -X GET "https://neptun-webui.vercel.app/api/og/https%3A%2F%2Fexample.com"
```

### Python Example

```python
import httpx
from urllib.parse import quote
from typing import Optional

async def fetch_og_data(url: str) -> dict:
    encoded_url = quote(url, safe='')
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://neptun-webui.vercel.app/api/og/{encoded_url}"
        )
        response.raise_for_status()
        return response.json()
```

### TypeScript/JavaScript Example

```typescript
async function fetchOgData(url: string): Promise<OgData> {
  const encodedUrl = encodeURIComponent(url)
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/og/${encodedUrl}`
  )

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return await response.json()
}
```

## Notes

- The URL parameter must be properly URL-encoded
- The endpoint uses caching to improve performance
- Includes a 5-second timeout for fetching OG data
- Uses a modern browser User-Agent to ensure proper data retrieval
- All fields in the response are optional as they depend on the metadata available at the URL
- The favicon field is automatically extracted if available
