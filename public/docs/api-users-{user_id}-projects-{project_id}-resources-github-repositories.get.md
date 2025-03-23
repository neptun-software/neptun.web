# Get Project GitHub Repositories Endpoint

## Overview

This endpoint retrieves all GitHub repositories associated with a project's GitHub App installation.

## Request Details

### HTTP Method

GET

### Route

`/api/users/{user_id}/projects/{project_id}/resources/github-repositories`

### Route Parameters

| Parameter  | Type    | Required | Description                      |
| ---------- | ------- | -------- | -------------------------------- |
| user_id    | integer | Yes      | The ID of the authenticated user |
| project_id | integer | Yes      | The ID of the project            |

### Headers

| Header | Value          | Required | Description                   |
| ------ | -------------- | -------- | ----------------------------- |
| Cookie | neptun-session | Yes      | Session authentication cookie |

### Query Parameters

No query parameters required.

### Request Body

No request body required.

## Response Format

### Response Status Codes

| Status Code | Description                                 |
| ----------- | ------------------------------------------- |
| 200         | Successfully retrieved repositories         |
| 401         | Unauthorized (invalid or missing session)   |
| 404         | Project not found or no GitHub installation |
| 500         | Failed to fetch repositories                |

### Success Response (200 OK)

```json
{
  "repositories": [
    {
      "id": "123",
      "name": "example-repo",
      "full_name": "octocat/example-repo",
      "private": false,
      "html_url": "https://github.com/octocat/example-repo",
      "description": "This is an example repository",
      "fork": false,
      "created_at": "2024-03-20T10:00:00Z",
      "updated_at": "2024-03-20T10:00:00Z",
      "pushed_at": "2024-03-20T10:00:00Z",
      "git_url": "git://github.com/octocat/example-repo.git",
      "ssh_url": "git@github.com:octocat/example-repo.git",
      "clone_url": "https://github.com/octocat/example-repo.git",
      "size": 1000,
      "stargazers_count": 80,
      "watchers_count": 80,
      "language": "TypeScript",
      "has_issues": true,
      "has_projects": true,
      "has_downloads": true,
      "has_wiki": true,
      "has_pages": false,
      "has_discussions": false,
      "forks_count": 25,
      "archived": false,
      "disabled": false,
      "open_issues_count": 10,
      "allow_forking": true,
      "is_template": false,
      "web_commit_signoff_required": false,
      "visibility": "public",
      "default_branch": "main",
      "github_account_id": "456",
      "github_account_name": "octocat"
    }
  ]
}
```

### Error Response (404 Not Found)

```json
{
  "statusCode": 404,
  "statusMessage": "Project not found"
}
```

### TypeScript Interfaces

```typescript
interface GithubRepository {
  id: string
  name: string
  full_name: string
  private: boolean
  html_url: string
  description: string | null
  fork: boolean
  created_at: string
  updated_at: string
  pushed_at: string
  git_url: string
  ssh_url: string
  clone_url: string
  size: number
  stargazers_count: number
  watchers_count: number
  language: string | null
  has_issues: boolean
  has_projects: boolean
  has_downloads: boolean
  has_wiki: boolean
  has_pages: boolean
  has_discussions: boolean
  forks_count: number
  archived: boolean
  disabled: boolean
  open_issues_count: number
  allow_forking: boolean
  is_template: boolean
  web_commit_signoff_required: boolean
  visibility: string
  default_branch: string
  github_account_id: string
  github_account_name: string
}

interface GetRepositoriesResponse {
  repositories: GithubRepository[]
}
```

### Python Models

```python
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class GithubRepository(BaseModel):
    id: str
    name: str
    full_name: str
    private: bool
    html_url: str
    description: Optional[str]
    fork: bool
    created_at: datetime
    updated_at: datetime
    pushed_at: datetime
    git_url: str
    ssh_url: str
    clone_url: str
    size: int
    stargazers_count: int
    watchers_count: int
    language: Optional[str]
    has_issues: bool
    has_projects: bool
    has_downloads: bool
    has_wiki: bool
    has_pages: bool
    has_discussions: bool
    forks_count: int
    archived: bool
    disabled: bool
    open_issues_count: int
    allow_forking: bool
    is_template: bool
    web_commit_signoff_required: bool
    visibility: str
    default_branch: str
    github_account_id: str
    github_account_name: str

class GetRepositoriesResponse(BaseModel):
    repositories: List[GithubRepository]
```

## Code Examples

### Python Example

```python
async def get_project_github_repositories(
    user_id: int,
    project_id: int,
    session_cookie: str
) -> GetRepositoriesResponse:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://neptun-webui.vercel.app/api/users/{user_id}/projects/{project_id}/resources/github-repositories",
            cookies={"neptun-session": session_cookie}
        )
        response.raise_for_status()
        return GetRepositoriesResponse(**response.json())
```

### cURL Example

```bash
curl -X GET \
  -H "Cookie: neptun-session=your-session-cookie" \
  "https://neptun-webui.vercel.app/api/users/your-user-id/projects/your-project-id/resources/github-repositories"
```

### TypeScript/JavaScript Example

```typescript
async function getProjectGithubRepositories(
  userId: number,
  projectId: number
): Promise<GetRepositoriesResponse> {
  const response = await fetch(
    `https://neptun-webui.vercel.app/api/users/${userId}/projects/${projectId}/resources/github-repositories`,
    {
      credentials: 'include', // Important for cookie handling
    }
  )

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return await response.json()
}
```

## Notes

- The session cookie is required for authentication
- The project must have an associated GitHub App installation
- Returns all repositories accessible through the GitHub App installation
- Repository data includes both GitHub repository information and account details
- All timestamps are in ISO 8601 format with UTC timezone
