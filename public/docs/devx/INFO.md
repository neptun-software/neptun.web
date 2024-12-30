# Routes

- `POST` [`/auth/otp`](../auth_otp.md)
- `POST` [`/{email}/reset-password`](../email_reset-password.md)
- `GET` [`/health`](../health.md)

## API Routes

- `POST` [`/api/ai/huggingface/{model_publisher}/{model_name}/chat`](../api_ai_huggingface_chat.md)

- `HEAD` [`/api/auth/check`](../api_auth_check.md)
- `POST` [`/api/auth/login`](../api_auth_login.md)
- `POST` [`/api/auth/logout`](../api_auth_logout.md)
- `POST` [`/api/auth/sign-up`](../api_auth_sign-up.md)

- `PATCH` && `DELETE` `/api/users/{user_id}` [update](../api_users_update.md) | [delete](../api_users_delete.md)
- `GET` [`/api/users/{user_id}/cli`](../api_users_cli.md)

- `GET` && `POST` && `DELETE` `/api/users/{user_id}/chats` [read, create, delete](../api_users_chats.md)
- `PATCH` && `DELETE` `/api/users/{user_id}/chats/{chat_id}` [update](../api_users_chats_update.md) | [delete](../api_users_chats_delete.md)

- `GET` [`/api/shared/chats/{uuid}`](../api_shared_chats.md)

- `GET` && `POST` `/api/users/{user_id}/chats/{chat_id}/messages` [read](../api_users_chats_messages.md) | [create](../api_users_chats_messages_create.md)
- `DELETE` [`/api/users/{user_id}/chats/{chat_id}/messages/last`](../api_users_chats_messages_last_delete.md)

- `GET` [`/api/users/{user_id}/chats/{chat_id}/files`](../api_users_chats_files.md)
- `POST` [`/api/users/{user_id}/chats/{chat_id}/files/{message_id}`](../api_users_chats_files_create.md)

- `GET` && `POST` `/api/users/{user_id}/chats/{chat_id}/shares` [read](../api_users_chats_shares.md) | [create](../api_users_chats_shares_create.md)
- `POST` [`/api/users/{user_id}/chats/{chat_id}/shares/{share_id}/whitelist-entries`](../api_users_chats_shares_whitelist_entries_create.md)

- `GET` [`/api/shared/collections`](../api_shared_collections.get.md)
- `GET` [`/api/shared/collections/{uuid}`](../api_shared_collections_uuid.get.md)
- `GET` [`/api/users/{user_id}/collections`](../api_users_collections.get.md)
- `POST` [`/api/users/{user_id}/collections`](../api_users_collections.post.md)
- `PATCH` && `DELETE` `/api/users/{user_id}/collections/{uuid}` [update](../api_users_collections_uuid.patch.md) | [delete](../api_users_collections_uuid.delete.md)
- `POST` [`/api/users/{user_id}/collections/{uuid}/templates`](../api_users_collections_uuid_templates.post.md)
- `GET` && `PATCH` && `DELETE` [read](../api_users_collections_uuid_templates_id.get.md) | [update](../api_users_collections_uuid_templates_id.patch.md) | [delete](../api_users_collections_uuid_templates_id.delete.md)

- `GET` [`/api/users/{user_id}/installations`](../api_users_installations.md)
- `GET` [`/api/users/{user_id}/installations/{installation_id}/imports`](../api_users_installations_imports.md)

- `GET` [`/api/html-to-markdown/{url}`](../api_html-to-markdown.md)
