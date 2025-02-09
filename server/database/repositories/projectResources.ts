import {
  createProjectChatConversation,
  readAllProjectChatConversations,
  readProjectChatConversation,
  deleteProjectChatConversation,
} from './projectChatConversations'
import {
  createProjectGithubInstallation,
  readAllProjectGithubInstallations,
  readProjectGithubInstallation,
  deleteProjectGithubInstallation,
} from './projectGithubInstallations'
import {
  createProjectTemplateCollection,
  readAllProjectTemplateCollections,
  readProjectTemplateCollection,
  deleteProjectTemplateCollection,
} from './projectTemplateCollections'
import {
  createProjectUserFile,
  readAllProjectUserFiles,
  readProjectUserFile,
  deleteProjectUserFile,
} from './projectUserFiles'

type ResourceType = 'user-files' | 'template-collections' | 'github-installations' | 'chat-conversations'

/* CREATE RESOURCE */
export async function createResource(
  project_id: number,
  resource_type: ResourceType,
  resource_id: number,
) {
  switch (resource_type) {
    case 'user-files':
      return await createProjectUserFile(project_id, resource_id)
    case 'template-collections':
      return await createProjectTemplateCollection(project_id, resource_id)
    case 'github-installations':
      return await createProjectGithubInstallation(project_id, resource_id)
    case 'chat-conversations':
      return await createProjectChatConversation(project_id, resource_id)
    default:
      throw new Error(`Invalid resource type: ${resource_type}`)
  }
}

/* READ ALL RESOURCES */
export async function readAllResources(
  project_id: number,
  resource_type: ResourceType,
) {
  switch (resource_type) {
    case 'user-files':
      return await readAllProjectUserFiles(project_id)
    case 'template-collections':
      return await readAllProjectTemplateCollections(project_id)
    case 'github-installations':
      return await readAllProjectGithubInstallations(project_id)
    case 'chat-conversations':
      return await readAllProjectChatConversations(project_id)
    default:
      throw new Error(`Invalid resource type: ${resource_type}`)
  }
}

/* READ RESOURCE */
export async function readResource(
  project_id: number,
  resource_type: ResourceType,
  resource_id: number,
) {
  switch (resource_type) {
    case 'user-files':
      return await readProjectUserFile(project_id, resource_id)
    case 'template-collections':
      return await readProjectTemplateCollection(project_id, resource_id)
    case 'github-installations':
      return await readProjectGithubInstallation(project_id, resource_id)
    case 'chat-conversations':
      return await readProjectChatConversation(project_id, resource_id)
    default:
      throw new Error(`Invalid resource type: ${resource_type}`)
  }
}

/* DELETE RESOURCE */
export async function deleteResource(
  project_id: number,
  resource_type: ResourceType,
  resource_id: number,
) {
  switch (resource_type) {
    case 'user-files':
      return await deleteProjectUserFile(project_id, resource_id)
    case 'template-collections':
      return await deleteProjectTemplateCollection(project_id, resource_id)
    case 'github-installations':
      return await deleteProjectGithubInstallation(project_id, resource_id)
    case 'chat-conversations':
      return await deleteProjectChatConversation(project_id, resource_id)
    default:
      throw new Error(`Invalid resource type: ${resource_type}`)
  }
}
