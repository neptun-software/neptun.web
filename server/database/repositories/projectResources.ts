import type {
  GetGithubAppInstallation,
  ReadChatConversation,
  ReadTemplateCollection,
  ReadUserFile,
} from '../../../lib/types/database.tables/schema'
import { eq } from 'drizzle-orm'
import { neptun_user_project } from '../../../lib/types/database.tables/schema'
import {
  createProjectChatConversation,
  deleteProjectChatConversation,
  readAllProjectChatConversations,
  readProjectChatConversation,
} from './projectChatConversations'
import { updateProjectContext } from './projectContext'
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
export type ProjectResource = ReadUserFile | ReadTemplateCollection | GetGithubAppInstallation | ReadChatConversation

/* CREATE RESOURCE */
export async function createResource(
  project_id: number,
  resource_type: ResourceType,
  resource_id: number,
): Promise<ProjectResource | null> {
  let result: ProjectResource | null = null
  let installation: GetGithubAppInstallation | null = null

  switch (resource_type) {
    case 'user-files':
      result = await createProjectUserFile(project_id, resource_id)
      break
    case 'template-collections':
      result = await createProjectTemplateCollection(project_id, resource_id)
      break
    case 'github-installations':
      installation = await createProjectGithubInstallation(project_id, resource_id)
      if (installation) {
        result = {
          ...installation,
          github_installation_id: installation.id,
        } as GetGithubAppInstallation
      }
      break
    case 'chat-conversations':
      result = await createProjectChatConversation(project_id, resource_id)
      break
    default:
      throw new Error(`Invalid resource type: ${String(resource_type)}`)
  }

  if (result) {
    const project = await db
      .select()
      .from(neptun_user_project)
      .where(eq(neptun_user_project.id, project_id))
      .limit(1)
      .catch(() => null)

    if (project && project.length > 0) {
      try {
        await updateProjectContext(project[0].neptun_user_id, project_id)
      } catch (err) {
        if (LOG_BACKEND) {
          console.error('Failed to update project context after resource creation:', err)
        }
      }
    }
  }

  return result
}

/* READ ALL RESOURCES */
export async function readAllResources(
  project_id: number,
  resource_type: ResourceType,
): Promise<ProjectResource[]> {
  switch (resource_type) {
    case 'user-files': {
      const files = await readAllProjectUserFiles(project_id)
      return (files || []) as ReadUserFile[]
    }
    case 'template-collections': {
      const templates = await readAllProjectTemplateCollections(project_id)
      return (templates || []) as ReadTemplateCollection[]
    }
    case 'github-installations': {
      const installations = await readAllProjectGithubInstallations(project_id)
      if (!installations) {
        return []
      }
      return installations.map(installation => ({
        ...installation,
        github_installation_id: installation.id,
      })) as GetGithubAppInstallation[]
    }
    case 'chat-conversations': {
      const conversations = await readAllProjectChatConversations(project_id)
      return (conversations || []) as ReadChatConversation[]
    }
    default:
      throw new Error(`Invalid resource type: ${String(resource_type)}`)
  }
}

/* READ RESOURCE */
export async function readResource(
  project_id: number,
  resource_type: ResourceType,
  resource_id: number,
): Promise<ProjectResource | null> {
  switch (resource_type) {
    case 'user-files':
      return readProjectUserFile(project_id, resource_id)
    case 'template-collections':
      return readProjectTemplateCollection(project_id, resource_id)
    case 'github-installations': {
      const installation = await readProjectGithubInstallation(project_id, resource_id)
      if (installation) {
        return {
          ...installation,
          github_installation_id: installation.id,
        } as GetGithubAppInstallation
      }
      return null
    }
    case 'chat-conversations':
      return readProjectChatConversation(project_id, resource_id)
    default:
      throw new Error(`Invalid resource type: ${String(resource_type)}`)
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
        throw new Error(`Invalid resource type: ${String(resource_type)}`)
    }
  })()

  if (result) {
    const project = await db
      .select()
      .from(neptun_user_project)
      .where(eq(neptun_user_project.id, project_id))
      .limit(1)
      .catch(() => null)

    if (project && project.length > 0) {
      try {
        await updateProjectContext(project[0].neptun_user_id, project_id)
      } catch (err) {
        if (LOG_BACKEND) {
          console.error('Failed to update project context after resource deletion:', err)
        }
      }
    }
  }

  return Boolean(result)
}

/* DELETE MULTIPLE RESOURCES */
export async function deleteResources(
  project_id: number,
  resource_type: ResourceType,
  resource_ids: number[],
): Promise<boolean> {
  switch (resource_type) {
    case 'user-files':
      return Promise.all(resource_ids.map(async id => deleteProjectUserFile(project_id, id)))
        .then(results => results.every(Boolean))
    case 'template-collections':
      return Promise.all(resource_ids.map(async id => deleteProjectTemplateCollection(project_id, id)))
        .then(results => results.every(Boolean))
    case 'github-installations':
      return Promise.all(resource_ids.map(async id => deleteProjectGithubInstallation(project_id, id)))
        .then(results => results.every(Boolean))
    case 'chat-conversations':
      return Promise.all(resource_ids.map(async id => deleteProjectChatConversation(project_id, id)))
        .then(results => results.every(Boolean))
    default:
      throw new Error(`Invalid resource type: ${String(resource_type)}`)
  }
}
