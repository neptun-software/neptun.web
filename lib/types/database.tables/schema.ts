// import { supportedShikiLanguages, supportedFileExtensionsMap } from '../../../utils/formatters'; // || '#imports' // causes cjs, mjs compatibility issues, thanks for nothing drizzle :|
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { AllowedAiModelsEnum, allowedModelsConst } from '../ai.models';
import type { Message } from 'ai';
import { z } from 'zod';
import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

// Types used, and not interfaces, because you do not get full intellisense on interfaces and we do not need any features that interfaces provide...
// Enums do not apply to all norm forms of relational databases, I know. They are nice tho, at least, till they are not, because you have to update them...
// TODO: create a setup script that generates tables with entries for possible values instead of enums.

export const primaryIdSchema = z.number().positive().int();

/* USERS */

export const chat_user = pgTable('chat_user', {
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
});

type NewUser = typeof chat_user.$inferInsert;
export type GetUser = typeof chat_user.$inferSelect;

export type UserToCreate = Omit<NewUser, 'id' | 'hashed_password'> & {
  password: string;
};
export type ReadUser = Omit<GetUser, 'hashed_password'>;

const InsertUserSchemaBase = createInsertSchema(chat_user);
export const InsertUserSchema = InsertUserSchemaBase.pick({
  primary_email: true,
  created_at: true,
  updated_at: true,
})
const SelectUserSchemaBase = createSelectSchema(chat_user);
export const SelectUserSchema = SelectUserSchemaBase.pick({
  id: true,
  primary_email: true,
  created_at: true,
  updated_at: true,
})

/* OAuth ACCOUNTS */

export const POSSIBLE_OAUTH_PROVIDERS = pgEnum('oauth_provider_enum', [
  'github',
  'google',
]);
export const chat_user_oauth_account = pgTable('chat_user_oauth_account', {
  id: serial('id').primaryKey(),
  provider: POSSIBLE_OAUTH_PROVIDERS('provider').notNull(),
  oauth_user_id: text('oauth_user_id').notNull(),
  oauth_email: text('oauth_email').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),

  chat_user_id: integer('chat_user_id')
    .notNull()
    .references(() => chat_user.id, { onDelete: 'cascade' }),
});

type NewOauthAccount = typeof chat_user_oauth_account.$inferInsert;
type GetOauthAccount = typeof chat_user_oauth_account.$inferSelect;

export type OauthAccountToCreate = Omit<
  NewOauthAccount,
  'id' | 'chat_user_id' | 'created_at' | 'updated_at'
> & {
  chat_user_id?: number /* so that a oauth account can be linked to an existing user */;
}
export type ReadOauthAccount = Omit<
  GetOauthAccount,
  'created_at' | 'updated_at'
>;

const InsertOauthAccountSchemaBase = createInsertSchema(chat_user_oauth_account);
export const InsertOauthAccountSchema = InsertOauthAccountSchemaBase.pick({
  oauth_user_id: true,
  oauth_email: true,
  provider: true,
})
const SelectOauthAccountSchemaBase = createSelectSchema(
  chat_user_oauth_account
);
export const SelectOauthAccountSchema = SelectOauthAccountSchemaBase.pick({
  id: true,
  chat_user_id: true,
  oauth_user_id: true,
  oauth_email: true,
  provider: true,
})

/* CHATS */

export const POSSIBLE_AI_MODELS = pgEnum('ai_model_enum', allowedModelsConst);
export const chat_conversation = pgTable('chat_conversation', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  model: POSSIBLE_AI_MODELS('model').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),

  chat_user_id: integer('chat_user_id')
    .notNull()
    .references(() => chat_user.id, { onDelete: 'cascade' }),
});

type NewChatConversation = typeof chat_conversation.$inferInsert;
type GetChatConversation = typeof chat_conversation.$inferSelect;

export type ChatConversationToCreate = Omit<NewChatConversation, 'id' | 'created_at' | 'updated_at'>
export type ReadChatConversation = GetChatConversation;

const InsertChatConversationSchemaBase = createInsertSchema(chat_conversation);
export const InsertChatConversationSchema = InsertChatConversationSchemaBase.pick({
  name: true,
  model: true,
}) /* chat_user_id: true */
export const ChatConversationToCreateSchema = z.object({
  model: z.nativeEnum(AllowedAiModelsEnum),
  name: z.string().min(3),
});
export const ChatConversationsToDelete = z.object({
  chat_ids: z.array(primaryIdSchema),
});
export const ChatConversationAttributesToUpdateSchema = z.object({
  name: z.string().min(3),
});
export const SelectChatConversationSchema = createSelectSchema(
  chat_conversation
);

/* MESSAGES */

/**
 * role: 'system' | **'user'** | **'assistant'** | 'function' | 'data' | 'tool'
 */
export enum Actor {
  'user' = 'user',
  'assistant' = 'assistant',
}
const Actors = [
  'user',
  'assistant',
] as const;
const typedActors: readonly Message['role'][] = Actors;
export const POSSIBLE_CHAT_CONVERSATION_MESSAGE_ACTORS = pgEnum('chat_conversation_message_actor_enum', typedActors as [string, ...string[]]);
export const chat_conversation_message = pgTable('chat_conversation_message', {
  id: serial('id').primaryKey(),
  message: text('message').notNull(),
  actor: POSSIBLE_CHAT_CONVERSATION_MESSAGE_ACTORS('actor').notNull().default('user'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),

  chat_user_id: integer('chat_user_id')
    .notNull()
    .references(() => chat_user.id, { onDelete: 'cascade' }),
  chat_conversation_id: integer('chat_conversation_id')
    .notNull()
    .references(() => chat_conversation.id, { onDelete: 'cascade' }),
});

type NewChatConversationMessage =
  typeof chat_conversation_message.$inferInsert;
type GetChatConversationMessage =
  typeof chat_conversation_message.$inferSelect;

export type ChatConversationMessageToCreate = Omit<
  NewChatConversationMessage,
  'id' | 'created_at' | 'updated_at'
>
export type ReadChatConversationMessage = GetChatConversationMessage;

const InsertChatConversationMessageSchemaBase = createInsertSchema(
  chat_conversation_message
);
export const InsertChatConversationMessageSchema = InsertChatConversationMessageSchemaBase.pick({
  message: true,
  actor: true,
}) /* chat_conversation_id: true, chat_user_id: true */
export const ChatConversationMessagesToCreateSchema = z.object({
  messages: z.array(
    z.object({
      content: z.string().trim().min(1),
      role: z.nativeEnum(Actor),
    })
  ),
});
export const ChatConversationMessagesToCreateUniversalSchema =
  ChatConversationMessagesToCreateSchema.or(
    z.object({
      message: z.string().trim().min(1),
      actor: z.nativeEnum(Actor),
    })
  );
export const SelectChatConversationMessageSchema = createSelectSchema(
  chat_conversation_message
);

/* FILES */

// TODO: add check, when drizzle supports checks, to check if language matches extension
// const POSSIBLE_CHAT_CONVERSATION_FILE_LANGUAGES = pgEnum('chat_conversation_file_languages_enum', Object.values(supportedShikiLanguages) as [string, ...string[]]);
// const POSSIBLE_CHAT_CONVERSATION_FILE_EXTENSIONS = pgEnum('chat_conversation_file_extensions_enum', Object.values(supportedFileExtensionsMap) as [string, ...string[]]);
export const chat_conversation_file = pgTable('chat_conversation_file', {
  id: serial('id').primaryKey(),
  title: text('title'),
  language: text('language').default('text').notNull(),
  extension: text('file_extension').default('txt').notNull(),
  text: text('text').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),

  chat_user_id: integer('chat_user_id')
    .notNull()
    .references(() => chat_user.id, { onDelete: 'cascade' }),
  chat_conversation_id: integer('chat_conversation_id')
    .notNull()
    .references(() => chat_conversation.id, { onDelete: 'cascade' }),
  chat_conversation_message_id: integer('chat_conversation_message_id')
    .notNull()
    .references(() => chat_conversation_message.id, { onDelete: 'cascade' }),
});

type NewChatConversationFile =
  typeof chat_conversation_file.$inferInsert;
type GetChatConversationFile =
  typeof chat_conversation_file.$inferSelect;

export type ChatConversationFileToCreate = Omit<NewChatConversationFile, 'id' | 'created_at' | 'updated_at'>
export type ReadChatConversationFile = GetChatConversationFile;

const InsertFileSchemaBase = createInsertSchema(chat_conversation_file);
export const InsertFileSchema = InsertFileSchemaBase.pick({
  title: true,
  language: true,
  extension: true,
  text: true,
}); // chat_user_id: true, chat_conversation_id: true, chat_conversation_message_id: true
export const InsertFileUniversalSchema = z
  .object({ files: z.array(InsertFileSchema) })
  .or(InsertFileSchema); // files: [] could be shortened to []
export const SelectFileSchema = createSelectSchema(chat_conversation_file);
