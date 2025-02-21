# Get Resource Details

Retrieve details of a specific resource.

## Request

### HTTP Method

GET

### Route

`/api/users/[user_id]/projects/[project_id]/resources/[resource_type]/[resource_id]`

### Route Parameters

| Parameter       | Type    | Required | Description                                                                                                 |
| --------------- | ------- | -------- | ----------------------------------------------------------------------------------------------------------- |
| `user_id`       | integer | Yes      | The ID of the authenticated user                                                                            |
| `project_id`    | integer | Yes      | The ID of the project                                                                                       |
| `resource_type` | string  | Yes      | Type of resource (e.g., 'user-files', 'template-collections', 'github-installations', 'chat-conversations') |
| `resource_id`   | integer | Yes      | The ID of the resource                                                                                      |

### Headers

| Header | Value            | Required | Description                   |
| ------ | ---------------- | -------- | ----------------------------- |
| Accept | application/json | Yes      | Specifies the response format |
| Cookie | neptun-session   | Yes      | Session authentication cookie |

### Query Parameters

No query parameters required.

## Response

### Response Status Codes

| Status Code | Description                               |
| ----------- | ----------------------------------------- |
| 200         | Successfully retrieved resource           |
| 400         | Bad request (invalid parameters)          |
| 401         | Unauthorized (invalid or missing session) |
| 403         | Forbidden (user_id mismatch)              |
| 404         | Resource not found                        |
| 500         | Server error                              |

### Success Response (200 OK)

Response varies based on the resource type:

#### For user-files

```json
{
  "id": 123,
  "title": "My File",
  "text": "File content",
  "language": "typescript",
  "extension": "ts",
  "created_at": "2025-02-16T17:42:11.000Z",
  "updated_at": "2025-02-16T17:42:11.000Z",
  "neptun_user_id": 456
}
```

#### For template-collections

```json
{
  "id": 123,
  "name": "My Template Collection",
  "description": "Collection description",
  "is_shared": false,
  "share_uuid": "550e8400-e29b-41d4-a716-446655440000",
  "created_at": "2025-02-16T17:42:11.000Z",
  "updated_at": "2025-02-16T17:42:11.000Z",
  "neptun_user_id": 456
}
```

#### For github-installations

```json
{
  "id": 123,
  "github_account_type": "User",
  "github_account_avatar_url": "https://avatars.githubusercontent.com/u/123?v=4",
  "github_account_id": "12345",
  "github_account_name": "username",
  "created_at": "2025-02-16T17:42:11.000Z",
  "updated_at": "2025-02-16T17:42:11.000Z",
  "neptun_user_id": 456
}
```

#### For chat-conversations

```json
{
  "id": 123,
  "name": "My Chat",
  "model": "google/gemma-2-7b-it",
  "created_at": "2025-02-16T17:42:11.000Z",
  "updated_at": "2025-02-16T17:42:11.000Z",
  "neptun_user_id": 456
}
```

### Error Response (400 Bad Request)

```json
{
  "statusCode": 400,
  "message": "Invalid resource type or ID"
}
```

## Notes

- Returns detailed information about a specific resource
- The project must belong to the specified user
- The resource must exist and be of the specified type
- All IDs must be valid positive integers
- Response structure varies based on resource type
- All timestamps are in ISO 8601 format with UTC timezone
- Resource-specific fields:
  - user-files: includes file content and metadata
  - template-collections: includes sharing information
  - github-installations: includes GitHub account details
  - chat-conversations: includes model configuration
