import type {
  GetGithubAppInstallation,
  ReadChatConversation,
  ReadTemplateCollection,
  ReadUserFile,
} from '../../../lib/types/database.tables/schema'
import {
  createProjectChatConversation,
  deleteProjectChatConversation,
  readAllProjectChatConversations,
  readProjectChatConversation,
} from './projectChatConversations'
import {
  createProjectGithubInstallation,
  deleteProjectGithubInstallation,
  readAllProjectGithubInstallations,
  readProjectGithubInstallation,
} from './projectGithubInstallations'
import {
  createProjectTemplateCollection,
  deleteProjectTemplateCollection,
  readAllProjectTemplateCollections,
  readProjectTemplateCollection,
} from './projectTemplateCollections'
import {
  createProjectUserFile,
  deleteProjectUserFile,
  readAllProjectUserFiles,
  readProjectUserFile,
} from './projectUserFiles'

export type ResourceType = 'user-files' | 'template-collections' | 'github-installations' | 'chat-conversations'

/* CREATE RESOURCE */
export async function createResource(
  project_id: number,
  resource_type: ResourceType,
  resource_id: number,
): Promise<ReadUserFile | ReadTemplateCollection | GetGithubAppInstallation | ReadChatConversation | null> {
  switch (resource_type) {
    case 'user-files':
      return createProjectUserFile(project_id, resource_id)
    case 'template-collections':
      return createProjectTemplateCollection(project_id, resource_id)
    case 'github-installations':
      return createProjectGithubInstallation(project_id, resource_id)
    case 'chat-conversations':
      return createProjectChatConversation(project_id, resource_id)
    default:
      throw new Error(`Invalid resource type: ${resource_type as ResourceType}`)
  }
}

/* READ ALL RESOURCES */
export async function readAllResources(
  project_id: number,
  resource_type: ResourceType,
): Promise<(ReadUserFile | ReadTemplateCollection | GetGithubAppInstallation | ReadChatConversation)[] | null> {
  switch (resource_type) {
    case 'user-files':
      return readAllProjectUserFiles(project_id)
    case 'template-collections':
      return readAllProjectTemplateCollections(project_id)
    case 'github-installations':
      return readAllProjectGithubInstallations(project_id)
    case 'chat-conversations':
      return readAllProjectChatConversations(project_id)
    default:
      throw new Error(`Invalid resource type: ${resource_type as ResourceType}`)
  }
}

/* READ RESOURCE */
export async function readResource(
  project_id: number,
  resource_type: ResourceType,
  resource_id: number,
): Promise<ReadUserFile | ReadTemplateCollection | GetGithubAppInstallation | ReadChatConversation | null> {
  switch (resource_type) {
    case 'user-files':
      return readProjectUserFile(project_id, resource_id)
    case 'template-collections':
      return readProjectTemplateCollection(project_id, resource_id)
    case 'github-installations':
      return readProjectGithubInstallation(project_id, resource_id)
    case 'chat-conversations':
      return readProjectChatConversation(project_id, resource_id)
    default:
      throw new Error(`Invalid resource type: ${resource_type as ResourceType}`)
  }
}

/* DELETE RESOURCE */
export async function deleteResource(
  project_id: number,
  resource_type: ResourceType,
  resource_id: number,
): Promise<boolean> {
  const result = await (async () => {
    switch (resource_type) {
      case 'user-files':
        return deleteProjectUserFile(project_id, resource_id)
      case 'template-collections':
        return deleteProjectTemplateCollection(project_id, resource_id)
      case 'github-installations':
        return deleteProjectGithubInstallation(project_id, resource_id)
      case 'chat-conversations':
        return deleteProjectChatConversation(project_id, resource_id)
      default:
        throw new Error(`Invalid resource type: ${resource_type as ResourceType}`)
    }
  })()

  return Boolean(result)
}
