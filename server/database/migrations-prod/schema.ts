import { boolean, foreignKey, integer, pgEnum, pgTable, serial, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'

export const aiModelEnum = pgEnum('ai_model_enum', ['OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5', 'mistralai/Mistral-7B-Instruct-v0.1', 'meta-llama/Meta-Llama-3-8B-Instruct'])
export const chatConversationMessageActorEnum = pgEnum('chat_conversation_message_actor_enum', ['user', 'assistant'])
export const oauthProviderEnum = pgEnum('oauth_provider_enum', ['github', 'google'])

export const chatConversation = pgTable('chat_conversation', {
  id: serial('id').primaryKey().notNull(),
  name: text('name').notNull(),
  model: aiModelEnum('model').notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow(),
  neptunUserId: integer('neptun_user_id').notNull(),
},
(table) => {
  return {
    chatConversationNeptunUserIdNeptunUserIdFk: foreignKey({
      columns: [table.neptunUserId],
      foreignColumns: [neptunUser.id],
      name: 'chat_conversation_neptun_user_id_neptun_user_id_fk',
    }).onDelete('cascade'),
  }
})

export const chatConversationFile = pgTable('chat_conversation_file', {
  id: serial('id').primaryKey().notNull(),
  title: text('title'),
  language: text('language').default('text').notNull(),
  fileExtension: text('file_extension').default('txt').notNull(),
  text: text('text').notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow(),
  neptunUserId: integer('neptun_user_id').notNull(),
  chatConversationId: integer('chat_conversation_id').notNull(),
  chatConversationMessageId: integer('chat_conversation_message_id').notNull(),
},
(table) => {
  return {
    chatConversationFileNeptunUserIdNeptunUserIdFk: foreignKey({
      columns: [table.neptunUserId],
      foreignColumns: [neptunUser.id],
      name: 'chat_conversation_file_neptun_user_id_neptun_user_id_fk',
    }).onDelete('cascade'),
    chatConversationFileChatConversationIdChatConversationI: foreignKey({
      columns: [table.chatConversationId],
      foreignColumns: [chatConversation.id],
      name: 'chat_conversation_file_chat_conversation_id_chat_conversation_i',
    }).onDelete('cascade'),
    chatConversationFileChatConversationMessageIdChatConver: foreignKey({
      columns: [table.chatConversationMessageId],
      foreignColumns: [chatConversationMessage.id],
      name: 'chat_conversation_file_chat_conversation_message_id_chat_conver',
    }).onDelete('cascade'),
  }
})

export const chatConversationMessage = pgTable('chat_conversation_message', {
  id: serial('id').primaryKey().notNull(),
  message: text('message').notNull(),
  actor: chatConversationMessageActorEnum('actor').default('user').notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow(),
  neptunUserId: integer('neptun_user_id').notNull(),
  chatConversationId: integer('chat_conversation_id').notNull(),
},
(table) => {
  return {
    chatConversationMessageNeptunUserIdNeptunUserIdFk: foreignKey({
      columns: [table.neptunUserId],
      foreignColumns: [neptunUser.id],
      name: 'chat_conversation_message_neptun_user_id_neptun_user_id_fk',
    }).onDelete('cascade'),
    chatConversationMessageChatConversationIdChatConversatio: foreignKey({
      columns: [table.chatConversationId],
      foreignColumns: [chatConversation.id],
      name: 'chat_conversation_message_chat_conversation_id_chat_conversatio',
    }).onDelete('cascade'),
  }
})

export const githubAppInstallation = pgTable('github_app_installation', {
  id: serial('id').primaryKey().notNull(),
  githubAccountType: text('github_account_type').notNull(),
  githubAccountAvatarUrl: text('github_account_avatar_url').notNull(),
  githubAccountId: integer('github_account_id').notNull(),
  githubAccountName: text('github_account_name'),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow(),
  neptunUserId: integer('neptun_user_id').notNull(),
},
(table) => {
  return {
    githubAppInstallationNeptunUserIdNeptunUserIdFk: foreignKey({
      columns: [table.neptunUserId],
      foreignColumns: [neptunUser.id],
      name: 'github_app_installation_neptun_user_id_neptun_user_id_fk',
    }).onDelete('cascade'),
  }
})

export const githubAppInstallationRepository = pgTable('github_app_installation_repository', {
  id: serial('id').primaryKey().notNull(),
  githubRepositoryId: integer('github_repository_id').notNull(),
  githubRepositoryName: text('github_repository_name').notNull(),
  githubRepositoryDescription: text('github_repository_description'),
  githubRepositorySize: integer('github_repository_size'),
  githubRepositoryLanguage: text('github_repository_language'),
  githubRepositoryLicense: text('github_repository_license'),
  githubRepositoryUrl: text('github_repository_url').notNull(),
  githubRepositoryWebsiteUrl: text('github_repository_website_url'),
  githubRepositoryDefaultBranch: text('github_repository_default_branch'),
  githubRepositoryIsPrivate: boolean('github_repository_is_private').notNull(),
  githubRepositoryIsFork: boolean('github_repository_is_fork'),
  githubRepositoryIsTemplate: boolean('github_repository_is_template'),
  githubRepositoryIsArchived: boolean('github_repository_is_archived').notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow(),
  githubAppInstallationId: integer('github_app_installation_id').notNull(),
},
(table) => {
  return {
    githubAppInstallationRepositoryGithubAppInstallationIdG: foreignKey({
      columns: [table.githubAppInstallationId],
      foreignColumns: [githubAppInstallation.id],
      name: 'github_app_installation_repository_github_app_installation_id_g',
    }).onDelete('cascade'),
  }
})

export const neptunUser = pgTable('neptun_user', {
  id: serial('id').primaryKey().notNull(),
  primaryEmail: text('primary_email').notNull(),
  hashedPassword: text('hashed_password'),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow(),
},
(table) => {
  return {
    neptunUserPrimaryEmailUnique: unique('neptun_user_primary_email_unique').on(table.primaryEmail),
  }
})

export const neptunUserOauthAccount = pgTable('neptun_user_oauth_account', {
  id: serial('id').primaryKey().notNull(),
  provider: oauthProviderEnum('provider').notNull(),
  oauthUserId: text('oauth_user_id').notNull(),
  oauthEmail: text('oauth_email').notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow(),
  neptunUserId: integer('neptun_user_id').notNull(),
},
(table) => {
  return {
    neptunUserOauthAccountNeptunUserIdNeptunUserIdFk: foreignKey({
      columns: [table.neptunUserId],
      foreignColumns: [neptunUser.id],
      name: 'neptun_user_oauth_account_neptun_user_id_neptun_user_id_fk',
    }).onDelete('cascade'),
  }
})

export const chatConversationShare = pgTable('chat_conversation_share', {
  id: serial('id').primaryKey().notNull(),
  isShared: boolean('is_shared').default(true).notNull(),
  shareId: uuid('share_id').defaultRandom().notNull(),
  isProtected: boolean('is_protected').default(false).notNull(),
  hashedPassword: text('hashed_password'),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow(),
  chatConversationId: integer('chat_conversation_id').notNull(),
},
(table) => {
  return {
    chatConversationShareChatConversationIdChatConversation: foreignKey({
      columns: [table.chatConversationId],
      foreignColumns: [chatConversation.id],
      name: 'chat_conversation_share_chat_conversation_id_chat_conversation_',
    }).onDelete('cascade'),
    chatConversationShareShareIdUnique: unique('chat_conversation_share_share_id_unique').on(table.shareId),
    chatConversationShareChatConversationIdUnique: unique('chat_conversation_share_chat_conversation_id_unique').on(table.chatConversationId),
  }
})

export const chatConversationShareWhitelistEntry = pgTable('chat_conversation_share_whitelist_entry', {
  id: serial('id').primaryKey().notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow(),
  whitelistedNeptunUserId: integer('whitelisted_neptun_user_id').notNull(),
  chatConversationShareId: integer('chat_conversation_share_id').notNull(),
},
(table) => {
  return {
    chatConversationShareWhitelistEntryWhitelistedNeptunUser: foreignKey({
      columns: [table.whitelistedNeptunUserId],
      foreignColumns: [neptunUser.id],
      name: 'chat_conversation_share_whitelist_entry_whitelisted_neptun_user',
    }).onDelete('cascade'),
    chatConversationShareWhitelistEntryChatConversationShare: foreignKey({
      columns: [table.chatConversationShareId],
      foreignColumns: [chatConversationShare.id],
      name: 'chat_conversation_share_whitelist_entry_chat_conversation_share',
    }).onDelete('cascade'),
  }
})
