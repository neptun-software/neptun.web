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

- `GET` [`/api/users/{user_id}/installations`](../api_users_installations.md)
- `GET` [`/api/users/{user_id}/installations/{installation_id}/imports`](../api_users_installations_imports.md)

- `GET` [`/api/html-to-markdown/{url}`](../api_html-to-markdown.md)

<!--
* `POST` `/api/ai/huggingface/{model_publisher}/{model_name}/chat`
* `HEAD` `/api/auth/check`
* `POST` `/api/auth/login`
* `POST` `/api/auth/logout`
* `POST` `/api/auth/sign-up`
* `GET` `/api/html-to-markdown/{url}`
* `GET` `/api/shared/chats/{uuid}`
* `DELETE` `/api/users/{user_id}/chats/{chat_id}`
* `POST` `/api/users/{user_id}/chats/{chat_id}/files/{message_id}`
* `GET` `/api/users/{user_id}/chats/{chat_id}/files`
* `POST` `/api/users/{user_id}/chats/{chat_id}/messages`
* `DELETE` `/api/users/{user_id}/chats/{chat_id}/messages/last`
* `GET` `/api/users/{user_id}/chats/{chat_id}/messages`
* `POST` `/api/users/{user_id}/chats/{chat_id}/shares`
* `POST` `/api/users/{user_id}/chats/{chat_id}/shares/{share_id}/whitelist-entries`
* `GET` `/api/users/{user_id}/chats/{chat_id}/shares`
* `PATCH` `/api/users/{user_id}/chats/{chat_id}`
* `GET` && `POST` && `DELETE` `/api/users/{user_id}/chats`
* `GET` `/api/users/{user_id}/cli`
* `DELETE` `/api/users/{user_id}`
* `GET` `/api/users/{user_id}/installations/{installation_id}/imports`
* `GET` `/api/users/{user_id}/installations`
* `PATCH` `/api/users/{user_id}`
-->
