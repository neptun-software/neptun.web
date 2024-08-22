import { relations } from 'drizzle-orm/relations';
import {
  neptun_user,
  chat_conversation_message,
  chat_conversation,
  neptun_user_oauth_account,
  chat_conversation_file,
  github_app_installation,
  github_app_installation_repository,
} from './schema';

export const chat_conversation_fileRelations = relations(
  chat_conversation_file,
  ({ one }) => ({
    neptun_user: one(neptun_user, {
      fields: [chat_conversation_file.neptun_user_id],
      references: [neptun_user.id],
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
    neptun_user: one(neptun_user, {
      fields: [chat_conversation_message.neptun_user_id],
      references: [neptun_user.id],
    }),
    chat_conversation: one(chat_conversation, {
      fields: [chat_conversation_message.chat_conversation_id],
      references: [chat_conversation.id],
    }),
    chat_conversation_files: many(chat_conversation_file),
  })
);

export const neptun_userRelations = relations(neptun_user, ({ many }) => ({
  chat_conversations: many(chat_conversation),
  chat_conversation_messages: many(chat_conversation_message),
  chat_conversation_files: many(chat_conversation_file),
  neptun_user_oauth_accounts: many(neptun_user_oauth_account),
}));

export const chat_conversationRelations = relations(
  chat_conversation,
  ({ one, many }) => ({
    chat_conversation_messages: many(chat_conversation_message),
    chat_conversation_files: many(chat_conversation_file),
    neptun_user: one(neptun_user, {
      fields: [chat_conversation.neptun_user_id],
      references: [neptun_user.id],
    }),
  })
);

export const neptun_user_oauth_accountRelations = relations(
  neptun_user_oauth_account,
  ({ one }) => ({
    neptun_user: one(neptun_user, {
      fields: [neptun_user_oauth_account.neptun_user_id],
      references: [neptun_user.id],
    }),
  })
);

export const github_app_installationRelations = relations(
  github_app_installation,
  ({ one, many }) => ({
    neptun_user: one(neptun_user, {
      fields: [github_app_installation.neptun_user_id],
      references: [neptun_user.id],
    }),
    github_app_installation_repositories: many(
      github_app_installation_repository
    ),
  })
);

export const github_app_installation_repositoryRelations = relations(
  github_app_installation_repository,
  ({ one }) => ({
    github_app_installation: one(github_app_installation, {
      fields: [github_app_installation_repository.github_app_installation_id],
      references: [github_app_installation.id],
    }),
  })
);
