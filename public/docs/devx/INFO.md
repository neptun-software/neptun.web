# Routes

- `POST` [`/auth/otp`](../auth-otp.post.md)
- `POST` [`/{email}/reset-password`](../email-{email}-reset-password.post.md)
- `GET` [`/health`](../health.get.md)

## API Routes

- `POST` [`/api/ai/huggingface/{model_publisher}/{model_name}/chat`](../api-ai-huggingface-{model_publisher}-{model_name}-chat.post.md)

- `HEAD` [`/api/auth/check`](../api-auth-check.head.md)
- `POST` [`/api/auth/login`](../api-auth-login.post.md)
- `POST` [`/api/auth/logout`](../api-auth-logout.post.md)
- `POST` [`/api/auth/sign-up`](../api-auth-sign-up.post.md)

- `PATCH` && `DELETE` `/api/users/{user_id}` [update](../api-users-{user_id}.patch.md) | [delete](../api-users-{user_id}.delete.md)
- `GET` [`/api/users/{user_id}/cli`](../api-users-{user_id}-cli.get.md)

- `GET` && `POST` && `DELETE` `/api/users/{user_id}/chats` [read, create, delete](../api-users-{user_id}-chats.get.post.delete.md)
- `PATCH` && `DELETE` `/api/users/{user_id}/chats/{chat_id}` [update](../api-users-{user_id}-chats-{chat_id}.patch.md) | [delete](../api-users-{user_id}-chats-{chat_id}.delete.md)

- `GET` [`/api/shared/chats/{uuid}`](../api-shared-chats-{uuid}.get.md)

- `GET` && `POST` `/api/users/{user_id}/chats/{chat_id}/messages` [read](../api-users-{user_id}-chats-{chat_id}-messages.get.md) | [create](../api-users-{user_id}-chats-{chat_id}-messages.post.md)
- `DELETE` [`/api/users/{user_id}/chats/{chat_id}/messages/last`](../api-users-{user_id}-chats-{chat_id}-messages-last.delete.md)

- `GET` [`/api/users/{user_id}/chats/{chat_id}/files`](../api-users-{user_id}-chats-{chat_id}-files.get.md)
- `POST` [`/api/users/{user_id}/chats/{chat_id}/files/{message_id}`](../api-users-{user_id}-chats-{chat_id}-files-{message_id}.post.md)

- `GET` && `POST` `/api/users/{user_id}/chats/{chat_id}/shares` [read](../api-users-{user_id}-chats-{chat_id}-shares.get.md) | [create](../api-users-{user_id}-chats-{chat_id}-shares.post.md)
- `POST` [`/api/users/{user_id}/chats/{chat_id}/shares/{share_id}/whitelist-entries`](../api-users-{user_id}-chats-{chat_id}-shares-{share_id}-whitelist-entries.post.md)

- `GET` [`/api/shared/collections`](../api-shared-collections.get.md)
- `GET` [`/api/shared/collections/{uuid}`](../api-shared-collections-{uuid}.get.md)
- `GET` [`/api/users/{user_id}/collections`](../api-users-{user_id}-collections.get.md)
- `POST` [`/api/users/{user_id}/collections`](../api-users-{user_id}-collections.post.md)
- `PATCH` && `DELETE` `/api/users/{user_id}/collections/{uuid}` [update](../api-users-{user_id}-collections-{uuid}.patch.md) | [delete](../api-users-{user_id}-collections-{uuid}.delete.md)
- `POST` [`/api/users/{user_id}/collections/{uuid}/templates`](../api-users-{user_id}-collections-{uuid}-templates.post.md)
- `GET` && `PATCH` && `DELETE` `/api/users/{user_id}/collections/{uuid}/templates/{id}` [read](../api-users-{user_id}-collections-{uuid}-templates-{id}.get.md) | [update](../api-users-{user_id}-collections-{uuid}-templates-{id}.patch.md) | [delete](../api-users-{user_id}-collections-{uuid}-templates-{id}.delete.md)

- `GET` [`/api/users/{user_id}/installations`](../api-users-{user_id}-installations.get.md)
- `GET` [`/api/users/{user_id}/installations/{installation_id}/imports`](../api-users-{user_id}-installations-{installation_id}-imports.get.md)

- `GET` [`/api/html-to-markdown/{url}`](../api-html-to-markdown-{url}.get.md)
