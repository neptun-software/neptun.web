import type { Message } from 'ai'
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
// import { supportedShikiLanguages, supportedFileExtensionsMap } from '../../../utils/formatters'; // || '#imports' // causes cjs, mjs compatibility issues, thanks for nothing drizzle :|
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { AllowedAiModelsEnum, allowedModelsConst } from '../ai.models'

// Types used, and not interfaces, because you do not get full intellisense on interfaces and we do not need any features that interfaces provide...
// Enums do not apply to all norm forms of relational databases, I know. They are nice tho, at least, till they are not, because you have to update them...
// TODO: create a setup script that generates tables with entries for possible values instead of enums.

export const primaryIdSchema = z.number().positive().int()

/* USERS */

export const neptun_user = pgTable('neptun_user', {
  id: serial('id').primaryKey(),
  primary_email: text('primary_email')
    .notNull()
    .unique() /* the email of the first oauth provider, if only oauth login is used */,
  hashed_password:
    text('hashed_password') /* null, if only oauth login is used */,
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),
})

type NewUser = typeof neptun_user.$inferInsert
export type GetUser = typeof neptun_user.$inferSelect

export type UserToCreate = Omit<NewUser, 'id' | 'hashed_password'> & {
  password: string
}
export type ReadUser = Omit<GetUser, 'hashed_password'>

const InsertUserSchemaBase = createInsertSchema(neptun_user)
export const InsertUserSchema = InsertUserSchemaBase.pick({
  primary_email: true,
  created_at: true,
  updated_at: true,
})
const SelectUserSchemaBase = createSelectSchema(neptun_user)
export const SelectUserSchema = SelectUserSchemaBase.pick({
  id: true,
  primary_email: true,
  created_at: true,
  updated_at: true,
})

/* USER FILES */

export const neptun_user_file = pgTable('neptun_user_file', {
  id: serial('id').primaryKey(),
  title: text('title'),
  text: text('text').notNull(),
  language: text('language').default('text').notNull(),
  extension: text('file_extension').default('txt').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),

  neptun_user_id: integer('neptun_user_id')
    .notNull()
    .references(() => neptun_user.id, { onDelete: 'cascade' }),
})

type NewUserFile = typeof neptun_user_file.$inferInsert
type GetUserFile = typeof neptun_user_file.$inferSelect

export type UserFileToCreate = Omit<NewUserFile, 'id' | 'created_at' | 'updated_at'>
export type ReadUserFile = GetUserFile

const InsertUserFileSchemaBase = createInsertSchema(neptun_user_file)
export const InsertUserFileSchema = InsertUserFileSchemaBase.pick({
  title: true,
  text: true,
  language: true,
  extension: true,
})
export const SelectUserFileSchema = createSelectSchema(neptun_user_file)

/* USERS TEMPLATE COLLECTIONS */

export const neptun_user_template_collection = pgTable('neptun_user_template_collection', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  is_shared: boolean('is_shared').default(false).notNull(),
  share_uuid: uuid('share_id').defaultRandom().notNull().unique(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),

  neptun_user_id: integer('neptun_user_id')
    .notNull()
    .references(() => neptun_user.id, { onDelete: 'cascade' }),
})

type NewTemplateCollection = typeof neptun_user_template_collection.$inferInsert
type GetTemplateCollection = typeof neptun_user_template_collection.$inferSelect

export type TemplateCollectionToCreate = Omit<NewTemplateCollection, 'id' | 'share_uuid' | 'created_at' | 'updated_at'>
export type ReadTemplateCollection = GetTemplateCollection

/* USERS TEMPLATES */

export const neptun_user_template = pgTable('neptun_user_template', {
  id: serial('id').primaryKey(),
  description: text('description'),
  file_name: text('file_name').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),

  neptun_user_id: integer('neptun_user_id')
    .notNull()
    .references(() => neptun_user.id, { onDelete: 'cascade' }),
  template_collection_id: integer('template_collection_id')
    .references(() => neptun_user_template_collection.id, { onDelete: 'cascade' }),
  user_file_id: integer('user_file_id')
    .references(() => neptun_user_file.id, { onDelete: 'cascade' }),
})

type NewTemplate = typeof neptun_user_template.$inferInsert
type GetTemplate = typeof neptun_user_template.$inferSelect

export type TemplateToCreate = Omit<NewTemplate, 'id' | 'created_at' | 'updated_at'>
export type ReadTemplate = GetTemplate

/* OAuth ACCOUNTS */

export const POSSIBLE_OAUTH_PROVIDERS = pgEnum('oauth_provider_enum', [
  'github',
  'google',
])
export const neptun_user_oauth_account = pgTable('neptun_user_oauth_account', {
  id: serial('id').primaryKey(),
  provider: POSSIBLE_OAUTH_PROVIDERS('provider').notNull(),
  oauth_user_id: text('oauth_user_id').notNull(),
  oauth_email: text('oauth_email').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),

  neptun_user_id: integer('neptun_user_id')
    .notNull()
    .references(() => neptun_user.id, { onDelete: 'cascade' }),
})

type NewOauthAccount = typeof neptun_user_oauth_account.$inferInsert
type GetOauthAccount = typeof neptun_user_oauth_account.$inferSelect

export type OauthAccountToCreate = Omit<
  NewOauthAccount,
  'id' | 'neptun_user_id' | 'created_at' | 'updated_at'
> & {
  neptun_user_id?: number /* so that a oauth account can be linked to an existing user */
}
export type ReadOauthAccount = Omit<
  GetOauthAccount,
  'created_at' | 'updated_at'
>

const InsertOauthAccountSchemaBase = createInsertSchema(
  neptun_user_oauth_account,
)
export const InsertOauthAccountSchema = InsertOauthAccountSchemaBase.pick({
  oauth_user_id: true,
  oauth_email: true,
  provider: true,
})
const SelectOauthAccountSchemaBase = createSelectSchema(
  neptun_user_oauth_account,
)
export const SelectOauthAccountSchema = SelectOauthAccountSchemaBase.pick({
  id: true,
  neptun_user_id: true,
  oauth_user_id: true,
  oauth_email: true,
  provider: true,
})

/* CHATS */

export const POSSIBLE_AI_MODELS = pgEnum('ai_model_enum', allowedModelsConst) // ALTER TYPE ai_model_enum ADD VALUE 'xxx';
export const chat_conversation = pgTable('chat_conversation', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  model: POSSIBLE_AI_MODELS('model').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),

  neptun_user_id: integer('neptun_user_id')
    .notNull()
    .references(() => neptun_user.id, { onDelete: 'cascade' }),
})

type NewChatConversation = typeof chat_conversation.$inferInsert
type GetChatConversation = typeof chat_conversation.$inferSelect

export type ChatConversationToCreate = Omit<
  NewChatConversation,
  'id' | 'created_at' | 'updated_at'
>
export type ReadChatConversation = GetChatConversation

const InsertChatConversationSchemaBase = createInsertSchema(chat_conversation)
export const InsertChatConversationSchema
  = InsertChatConversationSchemaBase.pick({
    name: true,
    model: true,
  }) /* neptun_user_id: true */
export const ChatConversationToCreateSchema = z.object({
  model: z.nativeEnum(AllowedAiModelsEnum),
  name: z.string().min(3),
})
export const ChatConversationsToDelete = z.object({
  chat_ids: z.array(primaryIdSchema),
})
export const ChatConversationAttributesToUpdateSchema = z.object({
  name: z.string().min(3),
})
export const SelectChatConversationSchema
  = createSelectSchema(chat_conversation)

/* SHARES */

export const chat_conversation_share = pgTable('chat_conversation_share', {
  id: serial('id').primaryKey(),
  is_shared: boolean('is_shared').default(true).notNull(),
  share_uuid: uuid('share_id').defaultRandom().notNull().unique(),
  is_protected: boolean('is_protected').default(false).notNull(),
  hashed_password: text('hashed_password'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),

  chat_conversation_id: integer('chat_conversation_id')
    .notNull()
    .unique()
    .references(() => chat_conversation.id, { onDelete: 'cascade' }),
})

type NewChatConversationShare = typeof chat_conversation_share.$inferInsert
type GetChatConversationShare = typeof chat_conversation_share.$inferSelect

export type ChatConversationShareToCreate = Omit<
  NewChatConversationShare,
  'id' | 'share_uuid' | 'created_at' | 'updated_at'
>
export type ReadChatConversationShare = GetChatConversationShare

const InsertChatConversationShareSchemaBase = createInsertSchema(
  chat_conversation_share,
)
export const InsertChatConversationShareSchema
  = InsertChatConversationShareSchemaBase.pick({
    is_shared: true,
    is_protected: true,
    hashed_password: true,
  })

/* SHARES - WHITELIST */

export const chat_conversation_share_whitelist_entry = pgTable(
  'chat_conversation_share_whitelist_entry',
  {
    id: serial('id').primaryKey(),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date()),

    whitelisted_neptun_user_id: integer('whitelisted_neptun_user_id')
      .notNull()
      .references(() => neptun_user.id, { onDelete: 'cascade' }),
    chat_conversation_share_id: integer('chat_conversation_share_id')
      .notNull()
      .references(() => chat_conversation_share.id, { onDelete: 'cascade' }),
  },
)

type NewChatConversationShareWhitelist =
  typeof chat_conversation_share_whitelist_entry.$inferInsert
type GetChatConversationShareWhitelist =
  typeof chat_conversation_share_whitelist_entry.$inferSelect

export type ChatConversationShareWhitelistToCreate = Omit<
  NewChatConversationShareWhitelist,
  'id' | 'created_at' | 'updated_at'
>
export type ReadChatConversationShareWhitelist =
  GetChatConversationShareWhitelist

const InsertChatConversationShareWhitelistSchemaBase = createInsertSchema(
  chat_conversation_share_whitelist_entry,
)
export const InsertChatConversationShareWhitelistSchema
  = InsertChatConversationShareWhitelistSchemaBase.pick({
    whitelisted_neptun_user_id: true,
  })
export const EmailListToCreateSchema = z
  .array(z.string().min(5).email())
  .min(1)

/* MESSAGES */

/**
 * role: 'system' | **'user'** | **'assistant'** | 'function' | 'data' | 'tool'
 */
export enum Actor {
  user = 'user',
  assistant = 'assistant',
}
const Actors = ['user', 'assistant'] as const
const typedActors: readonly Message['role'][] = Actors
export const POSSIBLE_CHAT_CONVERSATION_MESSAGE_ACTORS = pgEnum(
  'chat_conversation_message_actor_enum',
  typedActors as [string, ...string[]],
)
export const chat_conversation_message = pgTable('chat_conversation_message', {
  id: serial('id').primaryKey(),
  message: text('message').notNull(),
  actor: POSSIBLE_CHAT_CONVERSATION_MESSAGE_ACTORS('actor')
    .notNull()
    .default('user'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),

  neptun_user_id: integer('neptun_user_id')
    .notNull()
    .references(() => neptun_user.id, { onDelete: 'cascade' }),
  chat_conversation_id: integer('chat_conversation_id')
    .notNull()
    .references(() => chat_conversation.id, { onDelete: 'cascade' }),
})

type NewChatConversationMessage = typeof chat_conversation_message.$inferInsert
type GetChatConversationMessage = typeof chat_conversation_message.$inferSelect

export type ChatConversationMessageToCreate = Omit<
  NewChatConversationMessage,
  'id' | 'created_at' | 'updated_at'
>
export type ReadChatConversationMessage = GetChatConversationMessage

const InsertChatConversationMessageSchemaBase = createInsertSchema(
  chat_conversation_message,
)
export const InsertChatConversationMessageSchema
  = InsertChatConversationMessageSchemaBase.pick({
    message: true,
    actor: true,
  }) /* chat_conversation_id: true, neptun_user_id: true */
export const ChatConversationMessagesToCreateSchema = z.object({
  messages: z.array(
    z.object({
      content: z.string().trim().min(1),
      role: z.nativeEnum(Actor),
    }),
  ),
})
export const ChatConversationMessagesToCreateUniversalSchema
  = ChatConversationMessagesToCreateSchema.or(
    z.object({
      message: z.string().trim().min(1),
      actor: z.nativeEnum(Actor),
    }),
  )
export const SelectChatConversationMessageSchema = createSelectSchema(
  chat_conversation_message,
)

/* FILES */

// TODO: add check, when drizzle supports checks, to check if language matches extension
// const POSSIBLE_CHAT_CONVERSATION_FILE_LANGUAGES = pgEnum('chat_conversation_file_languages_enum', Object.values(supportedShikiLanguages) as [string, ...string[]]);
// const POSSIBLE_CHAT_CONVERSATION_FILE_EXTENSIONS = pgEnum('chat_conversation_file_extensions_enum', Object.values(supportedFileExtensionsMap) as [string, ...string[]]);
export const chat_conversation_file = pgTable('chat_conversation_file', {
  id: serial('id').primaryKey(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),

  /* NOTE: stores user_id, chat_id and message_id for quicker retrieval (get in file browser, in chat info and in connected message) */
  neptun_user_id: integer('neptun_user_id')
    .notNull()
    .references(() => neptun_user.id, { onDelete: 'cascade' }),
  chat_conversation_id: integer('chat_conversation_id')
    .notNull()
    .references(() => chat_conversation.id, { onDelete: 'cascade' }),
  chat_conversation_message_id: integer('chat_conversation_message_id')
    .notNull()
    .references(() => chat_conversation_message.id, { onDelete: 'cascade' }),
  neptun_user_file_id: integer('neptun_user_file_id')
    .notNull()
    .references(() => neptun_user_file.id, { onDelete: 'cascade' }),
})

type NewChatConversationFile = typeof chat_conversation_file.$inferInsert
type GetChatConversationFile = typeof chat_conversation_file.$inferSelect

export type ChatConversationFileToCreate = Omit<
  NewChatConversationFile,
  'id' | 'created_at' | 'updated_at' | 'neptun_user_file_id'
> & Pick<UserFileToCreate, 'title' | 'text' | 'language' | 'extension'>

export type ReadChatConversationFile = Omit<
  GetChatConversationFile,
  'neptun_user_file_id'
> & Pick<ReadUserFile, 'title' | 'text' | 'language' | 'extension'>

const InsertChatFileSchemaBase = createInsertSchema(chat_conversation_file)
export const InsertChatFileSchema = InsertChatFileSchemaBase.omit({
  id: true,
  created_at: true,
  updated_at: true,
  neptun_user_file_id: true,
}).merge(InsertUserFileSchema)

export const InsertFileUniversalSchema = z
  .object({ files: z.array(InsertChatFileSchema) })
  .or(InsertChatFileSchema) // files: [] could be shortened to []

export const SelectChatFileSchema = createSelectSchema(chat_conversation_file)

/* GITHUB APP INSTALLATION */

export const github_app_installation = pgTable('github_app_installation', {
  id: serial('id').primaryKey(),
  github_account_type: text('github_account_type').notNull(), // Organization or User (do not make me an enum, because it might break, if github changes their naming, which they do regularly without calling it a breaking change)
  github_account_avatar_url: text('github_account_avatar_url').notNull(), // should be encrypted in the future (includes id)
  github_account_id: integer('github_account_id').notNull(), // should be encrypted in the future
  github_account_name: text('github_account_name'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),

  neptun_user_id: integer('neptun_user_id')
    .notNull()
    .references(() => neptun_user.id, { onDelete: 'cascade' }),
})

export const SelectGithubAppInstallationSchema = createSelectSchema(
  github_app_installation,
)
const InsertGithubAppInstallationSchemaBase = createInsertSchema(
  github_app_installation,
)
export const InsertGithubAppInstallationSchema
  = InsertGithubAppInstallationSchemaBase.pick({
    github_account_type: true,
    github_account_avatar_url: true,
    github_account_id: true,
    github_account_name: true,
    neptun_user_id: true,
  })
export type NewGithubAppInstallation = z.infer<
  typeof InsertGithubAppInstallationSchema
>

/* GITHUB APP INSTALLATION - SELECTED REPOSITORIES */

export const github_app_installation_repository = pgTable(
  'github_app_installation_repository',
  {
    id: serial('id').primaryKey(),
    github_repository_id: integer('github_repository_id').notNull(),
    github_repository_name: text('github_repository_name').notNull(),
    github_repository_description: text('github_repository_description'),
    github_repository_size: integer('github_repository_size'),
    github_repository_language: text('github_repository_language'),
    github_repository_license: text('github_repository_license'),
    github_repository_url: text('github_repository_url').notNull(),
    github_repository_website_url: text('github_repository_website_url'),
    github_repository_default_branch: text('github_repository_default_branch'),
    github_repository_is_private: boolean(
      'github_repository_is_private',
    ).notNull(),
    github_repository_is_fork: boolean('github_repository_is_fork'),
    github_repository_is_template: boolean('github_repository_is_template'),
    github_repository_is_archived: boolean(
      'github_repository_is_archived',
    ).notNull(),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date()),

    github_app_installation_id: integer('github_app_installation_id')
      .notNull()
      .references(() => github_app_installation.id, { onDelete: 'cascade' }),
  },
)

export const SelectGithubAppInstallationRepositorySchema = createSelectSchema(
  github_app_installation_repository,
)
const InsertGithubAppInstallationRepositorySchemaBase = createInsertSchema(
  github_app_installation_repository,
)
export const InsertGithubAppInstallationRepositorySchema
  = InsertGithubAppInstallationRepositorySchemaBase.pick({
    github_repository_id: true,
    github_repository_name: true,
    github_repository_description: true,
    github_repository_size: true,
    github_repository_language: true,
    github_repository_license: true,
    github_repository_url: true,
    github_repository_website_url: true,
    github_repository_default_branch: true,
    github_repository_is_private: true,
    github_repository_is_fork: true,
    github_repository_is_template: true,
    github_repository_is_archived: true,
    github_app_installation_id: true,
  })
export type NewGithubAppInstallationRepository = z.infer<
  typeof InsertGithubAppInstallationRepositorySchema
>
