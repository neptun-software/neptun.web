import type { Message } from 'ai'
import {
  boolean,
  integer,
  jsonb,
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
import { AllowedAiModelsEnum, allowedModelsConst } from '../models/ai'

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

export type NewUserFile = typeof neptun_user_file.$inferInsert
export type GetUserFile = typeof neptun_user_file.$inferSelect
export type CodeBlock = Omit<GetUserFile, 'id' | 'neptun_user_id' | 'created_at' | 'updated_at'>

export type UserFileToCreate = Omit<NewUserFile, 'id' | 'created_at' | 'updated_at'>
export type ReadUserFile = GetUserFile

const InsertUserFileSchemaBase = createInsertSchema(neptun_user_file)
export const InsertUserFileSchema = InsertUserFileSchemaBase.pick({
  title: true,
  text: true,
  language: true,
  extension: true,
  neptun_user_id: true,
})
export const SelectUserFileSchema = createSelectSchema(
  neptun_user_file,
)

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

export const InsertTemplateCollectionSchemaBase = createInsertSchema(neptun_user_template_collection)
export const InsertTemplateCollectionSchema = InsertTemplateCollectionSchemaBase.pick({
  name: true,
  description: true,
  is_shared: true,
  neptun_user_id: true,
})
export const SelectTemplateCollectionSchema = createSelectSchema(
  neptun_user_template_collection,
)

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

export const InsertTemplateSchemaBase = createInsertSchema(neptun_user_template)
export const InsertTemplateSchema = InsertTemplateSchemaBase.pick({
  description: true,
  file_name: true,
  neptun_user_id: true,
})
export const SelectTemplateSchema = createSelectSchema(
  neptun_user_template,
)

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
  model: POSSIBLE_AI_MODELS('model').notNull(), // TODO: fix this being TEXT now...
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

export interface ShareInfo {
  shareExists: boolean
  shareIsActive: boolean
  shareIsPrivate: boolean
  shareHasPassword: boolean
}

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

export type ChatMessages = {
  id: ReadChatConversationMessage['id']
  message: ReadChatConversationMessage['message']
  actor: ReadChatConversationMessage['actor']
  chat_conversation: {
    id: ReadChatConversation['id']
    chat_conversation_shares: {
      id: ReadChatConversationShare['id']
      created_at: ReadChatConversationShare['created_at']
      updated_at: ReadChatConversationShare['updated_at']
      is_shared: ReadChatConversationShare['is_shared']
      is_protected: ReadChatConversationShare['is_protected']
    }[]
  }
}[]

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
  ).min(1),
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
  neptun_user_file_id: true, // assigned in repository
  chat_conversation_id: true, // in route params
  chat_conversation_message_id: true, // in route params
})
  .merge(InsertUserFileSchema)
  .omit({
    neptun_user_id: true, // in route params
  })

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
export type GetGithubAppInstallation = z.infer<
  typeof SelectGithubAppInstallationSchema
>
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
export type GetGithubAppInstallationRepository = z.infer<
  typeof SelectGithubAppInstallationRepositorySchema
>
export type GetGithubAppInstallationRepositoryEssentials = Omit<GetGithubAppInstallationRepository, 'id' | 'created_at' | 'updated_at'>
export type NewGithubAppInstallationRepository = z.infer<
  typeof InsertGithubAppInstallationRepositorySchema
>

/* PROJECT TYPES */

export const project_type = pgEnum('project_type', [
  'web-site',
  'web-service',
  'web-app',
])

export const programming_language = pgEnum('programming_language', [
  'typescript',
  'javascript',
  'php',
  'go',
  'python',
  'java',
  'kotlin',
  'ruby',
  'elixir',
])

export const neptun_user_project = pgTable('neptun_user_project', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  type: project_type('type').notNull(),
  main_language: programming_language('main_language').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),
  neptun_user_id: integer('neptun_user_id')
    .notNull()
    .references(() => neptun_user.id, { onDelete: 'cascade' }),
})

export const project_template_collection = pgTable('project_template_collection', {
  project_id: integer('project_id')
    .notNull()
    .references(() => neptun_user_project.id, { onDelete: 'cascade' }),
  template_collection_id: integer('template_collection_id')
    .notNull()
    .references(() => neptun_user_template_collection.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at').defaultNow(),
})

export const project_user_file = pgTable('project_user_file', {
  project_id: integer('project_id')
    .notNull()
    .references(() => neptun_user_project.id, { onDelete: 'cascade' }),
  user_file_id: integer('user_file_id')
    .notNull()
    .references(() => neptun_user_file.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at').defaultNow(),
})

export const project_github_installation = pgTable('project_github_installation', {
  project_id: integer('project_id')
    .notNull()
    .references(() => neptun_user_project.id, { onDelete: 'cascade' }),
  github_installation_id: integer('github_installation_id')
    .notNull()
    .references(() => github_app_installation.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at').defaultNow(),
})

export const project_chat_conversation = pgTable('project_chat_conversation', {
  project_id: integer('project_id')
    .notNull()
    .references(() => neptun_user_project.id, { onDelete: 'cascade' }),
  chat_conversation_id: integer('chat_conversation_id')
    .notNull()
    .references(() => chat_conversation.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at').defaultNow(),
})

export type NewProject = typeof neptun_user_project.$inferInsert
export type GetProject = typeof neptun_user_project.$inferSelect

export type ProjectToCreate = Omit<NewProject, 'id' | 'created_at' | 'updated_at' | 'neptun_user_id'>
export type ReadProject = GetProject

const InsertProjectSchemaBase = createInsertSchema(neptun_user_project)
export const InsertProjectSchema = InsertProjectSchemaBase.pick({
  name: true,
  description: true,
  type: true,
  main_language: true,
})
export const SelectProjectSchema = createSelectSchema(neptun_user_project)

const InsertProjectChatConversationSchemaBase = createInsertSchema(project_chat_conversation)
export const InsertProjectChatConversationSchema = InsertProjectChatConversationSchemaBase.pick({
  chat_conversation_id: true,
})
export const SelectProjectChatConversationSchema = createSelectSchema(project_chat_conversation)
export type ProjectChatConversationToCreate = z.infer<typeof InsertProjectChatConversationSchema>
export type ReadProjectChatConversation = z.infer<typeof SelectProjectChatConversationSchema>

const InsertProjectGithubInstallationSchemaBase = createInsertSchema(project_github_installation)
export const InsertProjectGithubInstallationSchema = InsertProjectGithubInstallationSchemaBase.pick({
  github_installation_id: true,
})
export const SelectProjectGithubInstallationSchema = createSelectSchema(project_github_installation)
export type ProjectGithubInstallationToCreate = z.infer<typeof InsertProjectGithubInstallationSchema>
export type ReadProjectGithubInstallation = z.infer<typeof SelectProjectGithubInstallationSchema>

const InsertProjectTemplateCollectionSchemaBase = createInsertSchema(project_template_collection)
export const InsertProjectTemplateCollectionSchema = InsertProjectTemplateCollectionSchemaBase.pick({
  template_collection_id: true,
})
export const SelectProjectTemplateCollectionSchema = createSelectSchema(project_template_collection)
export type ProjectTemplateCollectionToCreate = z.infer<typeof InsertProjectTemplateCollectionSchema>
export type ReadProjectTemplateCollection = z.infer<typeof SelectProjectTemplateCollectionSchema>

const InsertProjectUserFileSchemaBase = createInsertSchema(project_user_file)
export const InsertProjectUserFileSchema = InsertProjectUserFileSchemaBase.pick({
  user_file_id: true,
})
export const SelectProjectUserFileSchema = createSelectSchema(project_user_file)
export type ProjectUserFileToCreate = z.infer<typeof InsertProjectUserFileSchema>
export type ReadProjectUserFile = z.infer<typeof SelectProjectUserFileSchema>

/* CONTEXT FILES AND IMPORTS */

export const context_file_category = pgEnum('context_file_category', [
  'bundler',
  'build_tool',
  'server',
  'package_manager',
  'runtime',
  'documentation',
  'test_tool',
  'unknown',
])

export const import_source_type = pgEnum('import_source_type', [
  'local_folder',
  'github_repository_installation',
  'public_github_repository_url',
])

export const context_file_type = pgEnum('context_file_type', [
  'markdown',
  'pdf',
  'text',
])

export const neptun_context_import = pgTable('neptun_context_import', {
  id: serial('id').primaryKey(),
  source_type: import_source_type('source_type').notNull(),
  source_path: text('source_path').notNull(),
  source_ref: text('source_ref'),
  import_status: text('import_status').notNull().default('pending'),
  error_message: text('error_message'),
  file_tree: jsonb('file_tree'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),

  neptun_user_id: integer('neptun_user_id')
    .notNull()
    .references(() => neptun_user.id, { onDelete: 'cascade' }),
  project_id: integer('project_id')
    .references(() => neptun_user_project.id, { onDelete: 'cascade' }),
})

export const neptun_context_file = pgTable('neptun_context_file', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  original_path: text('original_path').notNull(),
  content: text('content').notNull(),
  file_type: context_file_type('file_type').notNull(),
  category: context_file_category('category'),
  file_size: integer('file_size'),
  pdf_url: text('pdf_url'),
  language: text('language').default('text').notNull(),
  metadata: jsonb('metadata'),
  parent_path: text('parent_path'),
  depth: integer('depth').default(0),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),

  neptun_user_id: integer('neptun_user_id')
    .notNull()
    .references(() => neptun_user.id, { onDelete: 'cascade' }),
  import_id: integer('import_id')
    .notNull()
    .references(() => neptun_context_import.id, { onDelete: 'cascade' }),
  project_id: integer('project_id')
    .references(() => neptun_user_project.id, { onDelete: 'cascade' }),
})

export type NewContextImport = typeof neptun_context_import.$inferInsert
export type GetContextImport = typeof neptun_context_import.$inferSelect

export type ContextImportToCreate = Omit<NewContextImport, 'id' | 'created_at' | 'updated_at'>
export type ReadContextImport = GetContextImport

const InsertContextImportSchemaBase = createInsertSchema(neptun_context_import)
export const InsertContextImportSchema = InsertContextImportSchemaBase.pick({
  source_type: true,
  source_path: true,
  source_ref: true,
  import_status: true,
  error_message: true,
  file_tree: true,
  neptun_user_id: true,
  project_id: true,
})
export const UpdateContextImportSchema = InsertContextImportSchema.partial()
export const SelectContextImportSchema = createSelectSchema(neptun_context_import)

export type NewContextFile = typeof neptun_context_file.$inferInsert
export type GetContextFile = typeof neptun_context_file.$inferSelect

export type ContextFileToCreate = Omit<NewContextFile, 'id' | 'created_at' | 'updated_at'>
export type ReadContextFile = GetContextFile

const InsertContextFileSchemaBase = createInsertSchema(neptun_context_file)
export const InsertContextFileSchema = InsertContextFileSchemaBase.pick({
  title: true,
  original_path: true,
  content: true,
  file_type: true,
  category: true,
  file_size: true,
  pdf_url: true,
  language: true,
  metadata: true,
  parent_path: true,
  depth: true,
  neptun_user_id: true,
  import_id: true,
  project_id: true,
})
export const UpdateContextFileSchema = InsertContextFileSchema.partial()
export const SelectContextFileSchema = createSelectSchema(neptun_context_file)
