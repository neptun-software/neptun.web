import { relations } from 'drizzle-orm/relations'
import { chatConversation, chatConversationFile, chatConversationMessage, chatConversationShare, chatConversationShareWhitelistEntry, githubAppInstallation, githubAppInstallationRepository, neptunUser, neptunUserOauthAccount } from './schema'

export const chatConversationRelations = relations(chatConversation, ({ one, many }) => ({
  neptunUser: one(neptunUser, {
    fields: [chatConversation.neptunUserId],
    references: [neptunUser.id],
  }),
  chatConversationFiles: many(chatConversationFile),
  chatConversationMessages: many(chatConversationMessage),
  chatConversationShares: many(chatConversationShare),
}))

export const neptunUserRelations = relations(neptunUser, ({ many }) => ({
  chatConversations: many(chatConversation),
  chatConversationFiles: many(chatConversationFile),
  chatConversationMessages: many(chatConversationMessage),
  githubAppInstallations: many(githubAppInstallation),
  neptunUserOauthAccounts: many(neptunUserOauthAccount),
  chatConversationShareWhitelistEntries: many(chatConversationShareWhitelistEntry),
}))

export const chatConversationFileRelations = relations(chatConversationFile, ({ one }) => ({
  neptunUser: one(neptunUser, {
    fields: [chatConversationFile.neptunUserId],
    references: [neptunUser.id],
  }),
  chatConversation: one(chatConversation, {
    fields: [chatConversationFile.chatConversationId],
    references: [chatConversation.id],
  }),
  chatConversationMessage: one(chatConversationMessage, {
    fields: [chatConversationFile.chatConversationMessageId],
    references: [chatConversationMessage.id],
  }),
}))

export const chatConversationMessageRelations = relations(chatConversationMessage, ({ one, many }) => ({
  chatConversationFiles: many(chatConversationFile),
  neptunUser: one(neptunUser, {
    fields: [chatConversationMessage.neptunUserId],
    references: [neptunUser.id],
  }),
  chatConversation: one(chatConversation, {
    fields: [chatConversationMessage.chatConversationId],
    references: [chatConversation.id],
  }),
}))

export const githubAppInstallationRelations = relations(githubAppInstallation, ({ one, many }) => ({
  neptunUser: one(neptunUser, {
    fields: [githubAppInstallation.neptunUserId],
    references: [neptunUser.id],
  }),
  githubAppInstallationRepositories: many(githubAppInstallationRepository),
}))

export const githubAppInstallationRepositoryRelations = relations(githubAppInstallationRepository, ({ one }) => ({
  githubAppInstallation: one(githubAppInstallation, {
    fields: [githubAppInstallationRepository.githubAppInstallationId],
    references: [githubAppInstallation.id],
  }),
}))

export const neptunUserOauthAccountRelations = relations(neptunUserOauthAccount, ({ one }) => ({
  neptunUser: one(neptunUser, {
    fields: [neptunUserOauthAccount.neptunUserId],
    references: [neptunUser.id],
  }),
}))

export const chatConversationShareRelations = relations(chatConversationShare, ({ one, many }) => ({
  chatConversation: one(chatConversation, {
    fields: [chatConversationShare.chatConversationId],
    references: [chatConversation.id],
  }),
  chatConversationShareWhitelistEntries: many(chatConversationShareWhitelistEntry),
}))

export const chatConversationShareWhitelistEntryRelations = relations(chatConversationShareWhitelistEntry, ({ one }) => ({
  neptunUser: one(neptunUser, {
    fields: [chatConversationShareWhitelistEntry.whitelistedNeptunUserId],
    references: [neptunUser.id],
  }),
  chatConversationShare: one(chatConversationShare, {
    fields: [chatConversationShareWhitelistEntry.chatConversationShareId],
    references: [chatConversationShare.id],
  }),
}))
