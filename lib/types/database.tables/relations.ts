import { relations } from 'drizzle-orm/relations';
import {
  chat_user,
  chat_conversation_message,
  chat_conversation,
  chat_user_oauth_account,
  chat_conversation_file,
  chat_github_app_installation,
  chat_github_app_installation_repository,
} from './schema';

export const chat_conversation_fileRelations = relations(
  chat_conversation_file,
  ({ one }) => ({
    chat_user: one(chat_user, {
      fields: [chat_conversation_file.chat_user_id],
      references: [chat_user.id],
    }),
    chat_conversation: one(chat_conversation, {
      fields: [chat_conversation_file.chat_conversation_id],
      references: [chat_conversation.id],
    }),
    chat_conversation_message: one(chat_conversation_message, {
      fields: [chat_conversation_file.chat_conversation_message_id],
      references: [chat_conversation_message.id],
    }),
  })
);

export const chat_conversation_messageRelations = relations(
  chat_conversation_message,
  ({ one, many }) => ({
    chat_user: one(chat_user, {
      fields: [chat_conversation_message.chat_user_id],
      references: [chat_user.id],
    }),
    chat_conversation: one(chat_conversation, {
      fields: [chat_conversation_message.chat_conversation_id],
      references: [chat_conversation.id],
    }),
    chat_conversation_files: many(chat_conversation_file),
  })
);

export const chat_userRelations = relations(chat_user, ({ many }) => ({
  chat_conversations: many(chat_conversation),
  chat_conversation_messages: many(chat_conversation_message),
  chat_conversation_files: many(chat_conversation_file),
  chat_user_oauth_accounts: many(chat_user_oauth_account),
}));

export const chat_conversationRelations = relations(
  chat_conversation,
  ({ one, many }) => ({
    chat_conversation_messages: many(chat_conversation_message),
    chat_conversation_files: many(chat_conversation_file),
    chat_user: one(chat_user, {
      fields: [chat_conversation.chat_user_id],
      references: [chat_user.id],
    }),
  })
);

export const chat_user_oauth_accountRelations = relations(
  chat_user_oauth_account,
  ({ one }) => ({
    chat_user: one(chat_user, {
      fields: [chat_user_oauth_account.chat_user_id],
      references: [chat_user.id],
    }),
  })
);

export const chat_github_app_installationRelations = relations(
  chat_github_app_installation,
  ({ one, many }) => ({
    chat_user: one(chat_user, {
      fields: [chat_github_app_installation.chat_user_id],
      references: [chat_user.id],
    }),
    chat_github_app_installation_repositories: many(
      chat_github_app_installation_repository
    ),
  })
);

export const chat_github_app_installation_repositoryRelations = relations(
  chat_github_app_installation_repository,
  ({ one }) => ({
    chat_github_app_installation: one(chat_github_app_installation, {
      fields: [chat_github_app_installation_repository.chat_github_app_installation_id],
      references: [chat_github_app_installation.id],
    }),
  })
);
