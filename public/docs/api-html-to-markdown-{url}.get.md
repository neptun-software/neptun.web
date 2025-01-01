# HTML to Markdown Converter Endpoint

## Overview

This endpoint converts HTML content from a given URL to Markdown format. It supports GitHub Flavored Markdown (GFM) and includes caching functionality.

## Request Details

### HTTP Method

GET

### Route

`/api/html-to-markdown/{url}`

### Route Parameters

| Parameter | Type   | Required | Description                                          |
| --------- | ------ | -------- | ---------------------------------------------------- |
| url       | string | Yes      | URL-encoded path to the HTML content to be converted |

### Headers

No specific headers required.

### Query Parameters

No query parameters required.

### Request Body

No request body required.

## Response Format

### Response Status Codes

| Status Code | Description                             |
| ----------- | --------------------------------------- |
| 200         | Successfully converted HTML to Markdown |
| 400         | Invalid URL or HTML parsing failed      |
| 404         | URL not found                           |
| 500         | Server error during conversion          |

### Success Response (200 OK)

Returns the converted markdown content as plain text.

#### Example Response

```text
# Sample Heading

This is a paragraph with **bold** and *italic* text.

- List item 1
- List item 2

[Link text](https://example.com)
```

### Error Responses

#### Bad Request (400)

When the URL is invalid or the HTML content cannot be parsed:

```json
{
  "statusCode": 400,
  "statusMessage": "Bad Request",
  "data": "FAILED"
}
```

### TypeScript Interface

```typescript
type HtmlToMarkdownResponse = string

interface HtmlToMarkdownError {
  statusCode: number
  statusMessage: string
  data: 'FAILED'
}
```

### Python Model

```python
from pydantic import BaseModel

class HtmlToMarkdownResponse(BaseModel):
    content: str

class HtmlToMarkdownError(BaseModel):
    statusCode: int
    statusMessage: str
    data: Literal["FAILED"]
```

## Code Examples

### cURL Example

```bash
curl -X GET "https://neptun-webui.vercel.app/api/html-to-markdown/https%3A%2F%2Fexample.com"
```

### Python Example

```python
from pydantic import BaseModel, HttpUrl
import httpx
from urllib.parse import quote

class HtmlToMarkdownResponse(BaseModel):
    markdown: str

async def convert_html_to_markdown(url: str) -> str:
    encoded_url = quote(url, safe='')
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://neptun-webui.vercel.app/api/html-to-markdown/{encoded_url}"
        )
        response.raise_for_status()
        return response.text
```

### TypeScript/JavaScript Example

```typescript
async function convertHtmlToMarkdown(url: string): Promise<string> {
  const encodedUrl = encodeURIComponent(url)
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/html-to-markdown/${encodedUrl}`
  )

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return await response.text()
}
```

## Notes

- The URL parameter must be properly URL-encoded
- The endpoint uses caching to improve performance
- Supports GitHub Flavored Markdown features
- HTML parsing errors are handled gracefully with appropriate error messages
