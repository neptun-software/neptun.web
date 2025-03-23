import type { ResourceType } from '~/lib/types/models/project'
import type { User } from '~/server/types/user'
import { and, eq, inArray, or } from 'drizzle-orm'
import {
  chat_conversation,
  chat_conversation_file,
  chat_conversation_message,
  chat_conversation_share,
  github_app_installation,
  github_app_installation_repository,
  neptun_context_file,
  neptun_context_import,
  neptun_user_file,
  neptun_user_project,
  neptun_user_template,
  neptun_user_template_collection,
  project_chat_conversation,
  project_github_installation,
  project_template_collection,
  project_user_file,
} from '~/lib/types/database.tables/schema'

export async function hasAccessToResource(
  user: User,
  resourceType: ResourceType,
  resourceId: number,
  projectId?: number,
): Promise<boolean> {
  switch (resourceType) {
    case 'user-files':
      return hasAccessToUserFiles(user, resourceId)
    case 'template-collections':
      return hasAccessToTemplateCollections(user, resourceId)
    case 'github-installations':
      return hasAccessToGithubInstallations(user, resourceId)
    case 'chat-conversations':
      return hasAccessToChatConversations(user, resourceId)
    case 'project-chat-conversations':
      if (!projectId) {
        return false
      }
      return hasAccessToProjectChatConversations(user, projectId, resourceId)
    case 'project-context-files':
      if (!projectId) {
        return false
      }
      return hasAccessToProjectContextFiles(user, projectId, resourceId)
    case 'project-context-imports':
      if (!projectId) {
        return false
      }
      return hasAccessToProjectContextImports(user, projectId, resourceId)
    case 'project-resources':
      if (!projectId) {
        return false
      }
      return hasAccessToProjectResources(user, projectId)
    case 'project-template-collections':
      if (!projectId) {
        return false
      }
      return hasAccessToProjectTemplateCollections(user, projectId, resourceId)
    case 'project-user-files':
      if (!projectId) {
        return false
      }
      return hasAccessToProjectUserFiles(user, projectId, resourceId)
    case 'project-github-installations':
      if (!projectId) {
        return false
      }
      return hasAccessToProjectGithubInstallations(user, projectId, resourceId)
    default:
      return false
  }
}

async function hasAccessToUserFiles(user: User, fileId: number): Promise<boolean> {
  const result = await db.select({ id: neptun_user_file.id })
    .from(neptun_user_file)
    .where(and(
      eq(neptun_user_file.neptun_user_id, user.id),
      eq(neptun_user_file.id, fileId),
    ))
    .limit(1)

  return result.length > 0
}

async function hasAccessToTemplateCollections(user: User, collectionId: number): Promise<boolean> {
  const result = await db.select({ id: neptun_user_template_collection.id })
    .from(neptun_user_template_collection)
    .where(and(
      eq(neptun_user_template_collection.neptun_user_id, user.id),
      eq(neptun_user_template_collection.id, collectionId),
    ))
    .limit(1)

  return result.length > 0
}

async function hasAccessToGithubInstallations(user: User, installationId: number): Promise<boolean> {
  const result = await db.select({ id: github_app_installation.id })
    .from(github_app_installation)
    .where(and(
      eq(github_app_installation.neptun_user_id, user.id),
      eq(github_app_installation.id, installationId),
    ))
    .limit(1)

  return result.length > 0
}

async function hasAccessToChatConversations(user: User, chatId: number): Promise<boolean> {
  const result = await db.select({ id: chat_conversation.id })
    .from(chat_conversation)
    .where(and(
      eq(chat_conversation.neptun_user_id, user.id),
      eq(chat_conversation.id, chatId),
    ))
    .limit(1)

  return result.length > 0
}

async function hasAccessToProjectChatConversations(user: User, projectId: number, chatId: number): Promise<boolean> {
  const result = await db.select({ id: chat_conversation.id })
    .from(chat_conversation)
    .innerJoin(project_chat_conversation, eq(chat_conversation.id, project_chat_conversation.chat_conversation_id))
    .innerJoin(neptun_user_project, eq(neptun_user_project.id, project_chat_conversation.project_id))
    .where(and(
      eq(neptun_user_project.neptun_user_id, user.id),
      eq(project_chat_conversation.project_id, projectId),
      eq(chat_conversation.id, chatId),
    ))
    .limit(1)

  return result.length > 0
}

async function hasAccessToProjectContextFiles(user: User, projectId: number, fileId: number): Promise<boolean> {
  const result = await db.select({ id: neptun_context_file.id })
    .from(neptun_context_file)
    .innerJoin(neptun_user_project, eq(neptun_user_project.id, neptun_context_file.project_id))
    .where(and(
      eq(neptun_user_project.neptun_user_id, user.id),
      eq(neptun_context_file.project_id, projectId),
      eq(neptun_context_file.id, fileId),
    ))
    .limit(1)

  return result.length > 0
}

async function hasAccessToProjectContextImports(user: User, projectId: number, importId: number): Promise<boolean> {
  const result = await db.select({ id: neptun_context_import.id })
    .from(neptun_context_import)
    .innerJoin(neptun_user_project, eq(neptun_user_project.id, neptun_context_import.project_id))
    .where(and(
      eq(neptun_user_project.neptun_user_id, user.id),
      eq(neptun_context_import.project_id, projectId),
      eq(neptun_context_import.id, importId),
    ))
    .limit(1)

  return result.length > 0
}

async function hasAccessToProjectResources(user: User, projectId: number): Promise<boolean> {
  const projectResult = await db.select({ id: neptun_user_project.id })
    .from(neptun_user_project)
    .where(and(
      eq(neptun_user_project.neptun_user_id, user.id),
      eq(neptun_user_project.id, projectId),
    ))
    .limit(1)

  return projectResult.length > 0
}

async function hasAccessToProjectTemplateCollections(user: User, projectId: number, collectionId: number): Promise<boolean> {
  const result = await db.select({ id: neptun_user_template_collection.id })
    .from(neptun_user_template_collection)
    .innerJoin(project_template_collection, eq(neptun_user_template_collection.id, project_template_collection.template_collection_id))
    .innerJoin(neptun_user_project, eq(neptun_user_project.id, project_template_collection.project_id))
    .where(and(
      eq(neptun_user_project.neptun_user_id, user.id),
      eq(project_template_collection.project_id, projectId),
      eq(neptun_user_template_collection.id, collectionId),
    ))
    .limit(1)

  return result.length > 0
}

async function hasAccessToProjectUserFiles(user: User, projectId: number, fileId: number): Promise<boolean> {
  const result = await db.select({ id: neptun_user_file.id })
    .from(neptun_user_file)
    .innerJoin(project_user_file, eq(neptun_user_file.id, project_user_file.user_file_id))
    .innerJoin(neptun_user_project, eq(neptun_user_project.id, project_user_file.project_id))
    .where(and(
      eq(neptun_user_project.neptun_user_id, user.id),
      eq(project_user_file.project_id, projectId),
      eq(neptun_user_file.id, fileId),
    ))
    .limit(1)

  return result.length > 0
}

async function hasAccessToProjectGithubInstallations(user: User, projectId: number, installationId: number): Promise<boolean> {
  const result = await db.select({ id: github_app_installation.id })
    .from(github_app_installation)
    .innerJoin(project_github_installation, eq(github_app_installation.id, project_github_installation.github_installation_id))
    .innerJoin(neptun_user_project, eq(neptun_user_project.id, project_github_installation.project_id))
    .where(and(
      eq(neptun_user_project.neptun_user_id, user.id),
      eq(project_github_installation.project_id, projectId),
      eq(github_app_installation.id, installationId),
    ))
    .limit(1)

  return result.length > 0
}

export async function hasAccessToProject(user: User, projectId: number): Promise<boolean> {
  const result = await db.select({ id: neptun_user_project.id })
    .from(neptun_user_project)
    .where(and(
      eq(neptun_user_project.neptun_user_id, user.id),
      eq(neptun_user_project.id, projectId),
    ))
    .limit(1)

  return result.length > 0
}

export async function hasAccessToMultipleResources(
  user: User,
  resourceType: ResourceType,
  resourceIds: number[],
  projectId?: number,
): Promise<boolean> {
  if (resourceIds.length === 0) {
    return true
  }

  switch (resourceType) {
    case 'user-files': {
      const result = await db.select({ id: neptun_user_file.id })
        .from(neptun_user_file)
        .where(and(
          eq(neptun_user_file.neptun_user_id, user.id),
          inArray(neptun_user_file.id, resourceIds),
        ))

      return result.length === resourceIds.length
    }
    case 'template-collections': {
      const result = await db.select({ id: neptun_user_template_collection.id })
        .from(neptun_user_template_collection)
        .where(and(
          eq(neptun_user_template_collection.neptun_user_id, user.id),
          inArray(neptun_user_template_collection.id, resourceIds),
        ))

      return result.length === resourceIds.length
    }
    case 'github-installations': {
      const result = await db.select({ id: github_app_installation.id })
        .from(github_app_installation)
        .where(and(
          eq(github_app_installation.neptun_user_id, user.id),
          inArray(github_app_installation.id, resourceIds),
        ))

      return result.length === resourceIds.length
    }
    case 'chat-conversations': {
      const result = await db.select({ id: chat_conversation.id })
        .from(chat_conversation)
        .where(and(
          eq(chat_conversation.neptun_user_id, user.id),
          inArray(chat_conversation.id, resourceIds),
        ))

      return result.length === resourceIds.length
    }
    case 'project-chat-conversations': {
      if (!projectId) {
        return false
      }
      const result = await db.select({ id: chat_conversation.id })
        .from(chat_conversation)
        .innerJoin(project_chat_conversation, eq(chat_conversation.id, project_chat_conversation.chat_conversation_id))
        .innerJoin(neptun_user_project, eq(neptun_user_project.id, project_chat_conversation.project_id))
        .where(and(
          eq(neptun_user_project.neptun_user_id, user.id),
          eq(project_chat_conversation.project_id, projectId),
          inArray(chat_conversation.id, resourceIds),
        ))

      return result.length === resourceIds.length
    }
    case 'project-context-files': {
      if (!projectId) {
        return false
      }
      const result = await db.select({ id: neptun_context_file.id })
        .from(neptun_context_file)
        .innerJoin(neptun_user_project, eq(neptun_user_project.id, neptun_context_file.project_id))
        .where(and(
          eq(neptun_user_project.neptun_user_id, user.id),
          eq(neptun_context_file.project_id, projectId),
          inArray(neptun_context_file.id, resourceIds),
        ))

      return result.length === resourceIds.length
    }
    case 'project-context-imports': {
      if (!projectId) {
        return false
      }
      const result = await db.select({ id: neptun_context_import.id })
        .from(neptun_context_import)
        .innerJoin(neptun_user_project, eq(neptun_user_project.id, neptun_context_import.project_id))
        .where(and(
          eq(neptun_user_project.neptun_user_id, user.id),
          eq(neptun_context_import.project_id, projectId),
          inArray(neptun_context_import.id, resourceIds),
        ))

      return result.length === resourceIds.length
    }
    case 'project-resources': {
      if (!projectId) {
        return false
      }
      const result = await db.select({ id: neptun_user_project.id })
        .from(neptun_user_project)
        .where(and(
          eq(neptun_user_project.neptun_user_id, user.id),
          eq(neptun_user_project.id, projectId),
        ))

      return result.length === resourceIds.length
    }
    case 'project-template-collections': {
      if (!projectId) {
        return false
      }
      const result = await db.select({ id: neptun_user_template_collection.id })
        .from(neptun_user_template_collection)
        .innerJoin(project_template_collection, eq(neptun_user_template_collection.id, project_template_collection.template_collection_id))
        .innerJoin(neptun_user_project, eq(neptun_user_project.id, project_template_collection.project_id))
        .where(and(
          eq(neptun_user_project.neptun_user_id, user.id),
          eq(project_template_collection.project_id, projectId),
          inArray(neptun_user_template_collection.id, resourceIds),
        ))

      return result.length === resourceIds.length
    }
    case 'project-user-files': {
      if (!projectId) {
        return false
      }
      const result = await db.select({ id: neptun_user_file.id })
        .from(neptun_user_file)
        .innerJoin(project_user_file, eq(neptun_user_file.id, project_user_file.user_file_id))
        .innerJoin(neptun_user_project, eq(neptun_user_project.id, project_user_file.project_id))
        .where(and(
          eq(neptun_user_project.neptun_user_id, user.id),
          eq(project_user_file.project_id, projectId),
          inArray(neptun_user_file.id, resourceIds),
        ))

      return result.length === resourceIds.length
    }
    case 'project-github-installations': {
      if (!projectId) {
        return false
      }
      const result = await db.select({ id: github_app_installation.id })
        .from(github_app_installation)
        .innerJoin(project_github_installation, eq(github_app_installation.id, project_github_installation.github_installation_id))
        .innerJoin(neptun_user_project, eq(neptun_user_project.id, project_github_installation.project_id))
        .where(and(
          eq(neptun_user_project.neptun_user_id, user.id),
          eq(project_github_installation.project_id, projectId),
          inArray(github_app_installation.id, resourceIds),
        ))

      return result.length === resourceIds.length
    }
    default:
      return false
  }
}

/**
 * Checks if a user has access to a specific template
 * Access can come through:
 * 1. Direct ownership (user created the template)
 * 2. Collection ownership (user owns the collection that contains the template)
 */
export async function hasAccessToTemplate(
  user: User,
  templateId: number,
): Promise<boolean> {
  const result = await db.select({ id: neptun_user_template.id })
    .from(neptun_user_template)
    .leftJoin(
      neptun_user_template_collection,
      eq(neptun_user_template.template_collection_id, neptun_user_template_collection.id),
    )
    .where(and(
      eq(neptun_user_template.id, templateId),
      // Check both direct ownership and collection ownership
      or(
        eq(neptun_user_template.neptun_user_id, user.id),
        eq(neptun_user_template_collection.neptun_user_id, user.id),
      ),
    ))
    .limit(1)

  return result.length > 0
}

export async function hasAccessToChatMessage(
  user: User,
  messageId: number,
): Promise<boolean> {
  const result = await db.select({ id: chat_conversation_message.id })
    .from(chat_conversation_message)
    .innerJoin(
      chat_conversation,
      eq(chat_conversation_message.chat_conversation_id, chat_conversation.id),
    )
    .where(and(
      eq(chat_conversation_message.id, messageId),
      eq(chat_conversation.neptun_user_id, user.id),
    ))
    .limit(1)

  return result.length > 0
}

export async function hasAccessToProjectChatMessage(
  user: User,
  projectId: number,
  messageId: number,
): Promise<boolean> {
  const result = await db.select({ id: chat_conversation_message.id })
    .from(chat_conversation_message)
    .innerJoin(
      chat_conversation,
      eq(chat_conversation_message.chat_conversation_id, chat_conversation.id),
    )
    .innerJoin(
      project_chat_conversation,
      eq(chat_conversation.id, project_chat_conversation.chat_conversation_id),
    )
    .innerJoin(
      neptun_user_project,
      eq(neptun_user_project.id, project_chat_conversation.project_id),
    )
    .where(and(
      eq(chat_conversation_message.id, messageId),
      eq(neptun_user_project.neptun_user_id, user.id),
      eq(project_chat_conversation.project_id, projectId),
    ))
    .limit(1)

  return result.length > 0
}

export async function hasAccessToChatShare(
  user: User,
  shareId: number,
): Promise<boolean> {
  const result = await db.select({ id: chat_conversation_share.id })
    .from(chat_conversation_share)
    .innerJoin(
      chat_conversation,
      eq(chat_conversation_share.chat_conversation_id, chat_conversation.id),
    )
    .where(and(
      eq(chat_conversation_share.id, shareId),
      eq(chat_conversation.neptun_user_id, user.id),
    ))
    .limit(1)

  return result.length > 0
}

export async function hasAccessToChatFile(
  user: User,
  chatFileId: number,
): Promise<boolean> {
  const result = await db.select({ id: chat_conversation_file.id })
    .from(chat_conversation_file)
    .innerJoin(
      chat_conversation,
      eq(chat_conversation_file.chat_conversation_id, chat_conversation.id),
    )
    .where(and(
      eq(chat_conversation_file.id, chatFileId),
      eq(chat_conversation.neptun_user_id, user.id),
    ))
    .limit(1)

  return result.length > 0
}

export async function hasAccessToProjectChatFile(
  user: User,
  projectId: number,
  chatFileId: number,
): Promise<boolean> {
  const result = await db.select({ id: chat_conversation_file.id })
    .from(chat_conversation_file)
    .innerJoin(
      chat_conversation,
      eq(chat_conversation_file.chat_conversation_id, chat_conversation.id),
    )
    .innerJoin(
      project_chat_conversation,
      eq(chat_conversation.id, project_chat_conversation.chat_conversation_id),
    )
    .innerJoin(
      neptun_user_project,
      eq(neptun_user_project.id, project_chat_conversation.project_id),
    )
    .where(and(
      eq(chat_conversation_file.id, chatFileId),
      eq(neptun_user_project.neptun_user_id, user.id),
      eq(project_chat_conversation.project_id, projectId),
    ))
    .limit(1)

  return result.length > 0
}

export async function hasAccessToGithubRepository(
  user: User,
  repositoryId: number,
): Promise<boolean> {
  const result = await db.select({ id: github_app_installation_repository.id })
    .from(github_app_installation_repository)
    .innerJoin(
      github_app_installation,
      eq(github_app_installation_repository.github_app_installation_id, github_app_installation.id),
    )
    .where(and(
      eq(github_app_installation_repository.id, repositoryId),
      eq(github_app_installation.neptun_user_id, user.id),
    ))
    .limit(1)

  return result.length > 0
}

export async function hasAccessToProjectGithubRepository(
  user: User,
  projectId: number,
  repositoryId: number,
): Promise<boolean> {
  const result = await db.select({ id: github_app_installation_repository.id })
    .from(github_app_installation_repository)
    .innerJoin(
      github_app_installation,
      eq(github_app_installation_repository.github_app_installation_id, github_app_installation.id),
    )
    .innerJoin(
      project_github_installation,
      eq(github_app_installation.id, project_github_installation.github_installation_id),
    )
    .innerJoin(
      neptun_user_project,
      eq(neptun_user_project.id, project_github_installation.project_id),
    )
    .where(and(
      eq(github_app_installation_repository.id, repositoryId),
      eq(neptun_user_project.neptun_user_id, user.id),
      eq(project_github_installation.project_id, projectId),
    ))
    .limit(1)

  return result.length > 0
}
