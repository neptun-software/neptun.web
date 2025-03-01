# Routes

- `POST` [`/auth/otp`](../auth-otp.post.md)
- `POST` [`/{email}/reset-password`](../email-{email}-reset-password.post.md)
- `GET` [`/health`](../health.get.md)

## API Routes

### AI Routes

- `POST` [`/api/ai/{model_publisher}/{model_name}/chat`](../api-ai-{model_publisher}-{model_name}-chat.post.md)
- `POST` [`/api/ai/huggingface/{model_publisher}/{model_name}/chat`](../api-ai-huggingface-{model_publisher}-{model_name}-chat.post.md)
- `POST` [`/api/ai/ollama/{model_name}/chat`](../api-ai-ollama-{model_name}-chat.post.md)
- `POST` [`/api/ai/openrouter/{model_name}/chat`](../api-ai-openrouter-{model_name}-chat.post.md)
- `POST` [`/api/ai/cloudflare/{model_name}/chat`](../api-ai-cloudflare-{model_name}-chat.post.md)

### Auth Routes

- `HEAD` [`/api/auth/check`](../api-auth-check.head.md)
- `POST` [`/api/auth/login`](../api-auth-login.post.md)
- `POST` [`/api/auth/logout`](../api-auth-logout.post.md)
- `POST` [`/api/auth/sign-up`](../api-auth-sign-up.post.md)

### User Routes

- `PATCH` && `DELETE` `/api/users/{user_id}` [update](../api-users-{user_id}.patch.md) | [delete](../api-users-{user_id}.delete.md)
- `GET` [`/api/users/{user_id}/cli`](../api-users-{user_id}-cli.get.md)

### Chat Routes

- `GET` && `POST` && `DELETE` `/api/users/{user_id}/chats` [read, create, delete](../api-users-{user_id}-chats.get.post.delete.md)
- `PATCH` && `DELETE` `/api/users/{user_id}/chats/{chat_id}` [update](../api-users-{user_id}-chats-{chat_id}.patch.md) | [delete](../api-users-{user_id}-chats-{chat_id}.delete.md)
- `GET` && `POST` `/api/users/{user_id}/chats/{chat_id}/messages` [read](../api-users-{user_id}-chats-{chat_id}-messages.get.md) | [create](../api-users-{user_id}-chats-{chat_id}-messages.post.md)
- `DELETE` [`/api/users/{user_id}/chats/{chat_id}/messages/last`](../api-users-{user_id}-chats-{chat_id}-messages-last.delete.md)
- `GET` [`/api/users/{user_id}/chats/{chat_id}/files`](../api-users-{user_id}-chats-{chat_id}-files.get.md)
- `POST` [`/api/users/{user_id}/chats/{chat_id}/files/{message_id}`](../api-users-{user_id}-chats-{chat_id}-files-{message_id}.post.md)
- `GET` && `POST` `/api/users/{user_id}/chats/{chat_id}/shares` [read](../api-users-{user_id}-chats-{chat_id}-shares.get.md) | [create](../api-users-{user_id}-chats-{chat_id}-shares.post.md)
- `POST` [`/api/users/{user_id}/chats/{chat_id}/shares/{share_id}/whitelist-entries`](../api-users-{user_id}-chats-{chat_id}-shares-{share_id}-whitelist-entries.post.md)
- `GET` [`/api/shared/chats/{uuid}`](../api-shared-chats-{uuid}.get.md)

### Collection Routes

- `GET` [`/api/shared/collections`](../api-shared-collections.get.md)
- `GET` [`/api/shared/collections/{uuid}`](../api-shared-collections-{uuid}.get.md)
- `GET` [`/api/users/{user_id}/collections`](../api-users-{user_id}-collections.get.md)
- `POST` [`/api/users/{user_id}/collections`](../api-users-{user_id}-collections.post.md)
- `PATCH` && `DELETE` `/api/users/{user_id}/collections/{collection_id}` [update](../api-users-{user_id}-collections-{collection_id}.patch.md) | [delete](../api-users-{user_id}-collections-{collection_id}.delete.md)
- `POST` [`/api/users/{user_id}/collections/{collection_id}/templates`](../api-users-{user_id}-collections-{collection_id}-templates.post.md)
- `GET` && `PATCH` && `DELETE` `/api/users/{user_id}/collections/{collection_id}/templates/{template_id}` [read](../api-users-{user_id}-collections-{collection_id}-templates-{template_id}.get.md) | [update](../api-users-{user_id}-collections-{collection_id}-templates-{template_id}.patch.md) | [delete](../api-users-{user_id}-collections-{collection_id}-templates-{template_id}.delete.md)

### Installation Routes

- `GET` [`/api/users/{user_id}/installations`](../api-users-{user_id}-installations.get.md)
- `DELETE` [`/api/users/{user_id}/installations/{installation_id}`](../api-users-{user_id}-installations-{installation_id}.delete.md)
- `GET` [`/api/users/{user_id}/installations/{installation_id}/imports`](../api-users-{user_id}-installations-{installation_id}-imports.get.md)

### Project Routes

- `POST` [`/api/users/{user_id}/projects`](../api-users-{user_id}-projects.post.md)
- `GET` [`/api/users/{user_id}/projects?project_type=xxx&programming_language=xxx`](../api-users-{user_id}-projects.get.md)
- `GET` [`/api/users/{user_id}/projects/{project_id}`](../api-users-{user_id}-projects-{project_id}.get.md)
- `PATCH` [`/api/users/{user_id}/projects/{project_id}`](../api-users-{user_id}-projects-{project_id}.patch.md)
- `DELETE` [`/api/users/{user_id}/projects/{project_id}`](../api-users-{user_id}-projects-{project_id}.delete.md)
- `GET` `/api/users/{user_id}/projects/{project_id}/chats` [read](../api-users-{user_id}-projects-{project_id}-chats.get.md)

### Project Resources Routes

- `POST` [`/api/users/{user_id}/projects/{project_id}/resources/{resource_type}`](../api-users-{user_id}-projects-{project_id}-resources-{resource_type}.post.md)
- `GET` [`/api/users/{user_id}/projects/{project_id}/resources/{resource_type}`](../api-users-{user_id}-projects-{project_id}-resources-{resource_type}.get.md)
- `GET` [`/api/users/{user_id}/projects/{project_id}/resources/{resource_type}/{resource_id}`](../api-users-{user_id}-projects-{project_id}-resources-{resource_type}-{resource_id}.get.md)
- `DELETE` [`/api/users/{user_id}/projects/{project_id}/resources/{resource_type}/{resource_id}`](../api-users-{user_id}-projects-{project_id}-resources-{resource_type}-{resource_id}.delete.md)

### Project Imports Routes

- `POST` [`/api/users/{user_id}/projects/{project_id}/resources/imports`](../api-users-{user_id}-projects-{project_id}-resources-imports.post.md)
- `GET` [`/api/users/{user_id}/projects/{project_id}/resources/imports?import_source_type=xxx`](../api-users-{user_id}-projects-{project_id}-resources-imports.get.md)
- `PUT` [`/api/users/{user_id}/projects/{project_id}/resources/imports/{import_id}`](../api-users-{user_id}-projects-{project_id}-resources-imports-{import_id}.put.md)
- `DELETE` [`/api/users/{user_id}/projects/{project_id}/resources/imports/{import_id}`](../api-users-{user_id}-projects-{project_id}-resources-imports-{import_id}.delete.md)

### Project Files Routes

- `POST` [`/api/users/{user_id}/projects/{project_id}/resources/files`](../api-users-{user_id}-projects-{project_id}-resources-files.post.md)
- `GET` [`/api/users/{user_id}/projects/{project_id}/resources/files?context_file_category=xxx&context_file_type=xxx`](../api-users-{user_id}-projects-{project_id}-resources-files.get.md)
- `PUT` [`/api/users/{user_id}/projects/{project_id}/resources/files/{context_file_id}`](../api-users-{user_id}-projects-{project_id}-resources-files-{context_file_id}.put.md)
- `DELETE` [`/api/users/{user_id}/projects/{project_id}/resources/files/{context_file_id}`](../api-users-{user_id}-projects-{project_id}-resources-files-{context_file_id}.delete.md)

### Model Routes

- `GET` [`/models`](../models.get.md)

### Other Routes

- `GET` [`/api/html-to-markdown/{url}`](../api-html-to-markdown-{url}.get.md)
- `GET` [`/api/users/{user_id}/files`](../api-users-{user_id}-files.get.md)
