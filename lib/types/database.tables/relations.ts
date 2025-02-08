import { relations } from 'drizzle-orm/relations'
import {
  chat_conversation,
  chat_conversation_file,
  chat_conversation_message,
  chat_conversation_share,
  chat_conversation_share_whitelist_entry,
  github_app_installation,
  github_app_installation_repository,
  neptun_user,
  neptun_user_file,
  neptun_user_oauth_account,
  neptun_user_template,
  neptun_user_template_collection,
  neptun_user_project,
  project_template_collection,
  project_user_file,
  project_github_installation,
  project_chat_conversation,
} from './schema'

export const neptun_userRelations = relations(
  neptun_user,
  ({ many }) => ({
    neptun_user_oauth_accounts: many(neptun_user_oauth_account),
    github_app_installations: many(github_app_installation),
    chat_conversations: many(chat_conversation),
    chat_conversation_share_whitelists: many(
      chat_conversation_share_whitelist_entry,
    ),
    chat_conversation_messages: many(chat_conversation_message),
    chat_conversation_files: many(chat_conversation_file),
    templates: many(neptun_user_template),
    template_collections: many(neptun_user_template_collection),
    projects: many(neptun_user_project),
  }))

export const neptun_user_oauth_accountRelations = relations(
  neptun_user_oauth_account,
  ({ one }) => ({
    neptun_user: one(neptun_user, {
      fields: [neptun_user_oauth_account.neptun_user_id],
      references: [neptun_user.id],
    }),
  }),
)

export const github_app_installationRelations = relations(
  github_app_installation,
  ({ one, many }) => ({
    neptun_user: one(neptun_user, {
      fields: [github_app_installation.neptun_user_id],
      references: [neptun_user.id],
    }),
    github_app_installation_repositories: many(
      github_app_installation_repository,
    ),
  }),
)

export const github_app_installation_repositoryRelations = relations(
  github_app_installation_repository,
  ({ one }) => ({
    github_app_installation: one(github_app_installation, {
      fields: [github_app_installation_repository.github_app_installation_id],
      references: [github_app_installation.id],
    }),
  }),
)

export const chat_conversationRelations = relations(
  chat_conversation,
  ({ one, many }) => ({
    chat_conversation_messages: many(chat_conversation_message),
    chat_conversation_files: many(chat_conversation_file),
    chat_conversation_shares: many(chat_conversation_share),
    neptun_user: one(neptun_user, {
      fields: [chat_conversation.neptun_user_id],
      references: [neptun_user.id],
    }),
  }),
)

export const chat_conversation_shareRelations = relations(
  chat_conversation_share,
  ({ one, many }) => ({
    chat_conversation: one(chat_conversation, {
      fields: [chat_conversation_share.chat_conversation_id],
      references: [chat_conversation.id],
    }),
    chat_conversation_shares_whitelisted: many(
      chat_conversation_share_whitelist_entry,
    ),
  }),
)

export const chat_conversation_share_whitelistRelations = relations(
  chat_conversation_share_whitelist_entry,
  ({ one }) => ({
    neptun_user_id: one(neptun_user, {
      fields: [
        chat_conversation_share_whitelist_entry.whitelisted_neptun_user_id,
      ],
      references: [neptun_user.id],
    }),
    chat_conversation_share: one(chat_conversation_share, {
      fields: [
        chat_conversation_share_whitelist_entry.chat_conversation_share_id,
      ],
      references: [chat_conversation_share.id],
    }),
  }),
)

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
  }),
)

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
    neptun_user_file: one(neptun_user_file, {
      fields: [chat_conversation_file.neptun_user_file_id],
      references: [neptun_user_file.id],
    }),
  }))

export const neptun_user_fileRelations = relations(
  neptun_user_file,
  ({ one }) => ({
    neptun_user: one(neptun_user, {
      fields: [neptun_user_file.neptun_user_id],
      references: [neptun_user.id],
    }),
  }))

export const neptun_user_templateRelations = relations(
  neptun_user_template,
  ({ one }) => ({
    neptun_user: one(neptun_user, {
      fields: [neptun_user_template.neptun_user_id],
      references: [neptun_user.id],
    }),
    template_collection: one(neptun_user_template_collection, {
      fields: [neptun_user_template.template_collection_id],
      references: [neptun_user_template_collection.id],
    }),
    neptun_user_file: one(neptun_user_file, {
      fields: [neptun_user_template.user_file_id],
      references: [neptun_user_file.id],
    }),
  }))

export const neptun_user_template_collectionRelations = relations(
  neptun_user_template_collection,
  ({ one, many }) => ({
    neptun_user: one(neptun_user, {
      fields: [neptun_user_template_collection.neptun_user_id],
      references: [neptun_user.id],
    }),
    templates: many(neptun_user_template),
  }),
)

export const projectRelations = relations(
  neptun_user_project,
  ({ one, many }) => ({
    neptun_user: one(neptun_user, {
      fields: [neptun_user_project.neptun_user_id],
      references: [neptun_user.id],
    }),
    template_collections: many(project_template_collection),
    user_files: many(project_user_file),
    github_installations: many(project_github_installation),
    chat_conversations: many(project_chat_conversation),
  }),
)

// Why 1:1? - Because a project can have only one template collection, but a template collection can be part of multiple projects.
// It should be possible to remove the relations easily.

export const project_template_collectionRelations = relations(
  project_template_collection,
  ({ one }) => ({
    project: one(neptun_user_project, {
      fields: [project_template_collection.project_id],
      references: [neptun_user_project.id],
    }),
    template_collection: one(neptun_user_template_collection, {
      fields: [project_template_collection.template_collection_id],
      references: [neptun_user_template_collection.id],
    }),
  }),
)

export const project_user_fileRelations = relations(
  project_user_file,
  ({ one }) => ({
    project: one(neptun_user_project, {
      fields: [project_user_file.project_id],
      references: [neptun_user_project.id],
    }),
    user_file: one(neptun_user_file, {
      fields: [project_user_file.user_file_id],
      references: [neptun_user_file.id],
    }),
  }),
)

export const project_github_installationRelations = relations(
  project_github_installation,
  ({ one }) => ({
    project: one(neptun_user_project, {
      fields: [project_github_installation.project_id],
      references: [neptun_user_project.id],
    }),
    github_installation: one(github_app_installation, {
      fields: [project_github_installation.github_installation_id],
      references: [github_app_installation.id],
    }),
  }),
)

export const project_chat_conversationRelations = relations(
  project_chat_conversation,
  ({ one }) => ({
    project: one(neptun_user_project, {
      fields: [project_chat_conversation.project_id],
      references: [neptun_user_project.id],
    }),
    chat_conversation: one(chat_conversation, {
      fields: [project_chat_conversation.chat_conversation_id],
      references: [chat_conversation.id],
    }),
  }),
)
