import type {
  context_file_category,
  context_file_type,
  ContextFileToCreate,
  GetGithubAppInstallation,
  ProjectChatConversationToCreate,
  ProjectGithubInstallationToCreate,
  ProjectTemplateCollectionToCreate,
  ProjectUserFileToCreate,
  ReadChatConversation,
  ReadContextFile,
  ReadContextImport,
  ReadTemplateCollection,
  ReadUserFile,
} from '~/lib/types/database.tables/schema'

export type ResourceType = 'user-files' | 'template-collections' | 'github-installations' | 'chat-conversations'
export type Resource = ReadUserFile | ReadTemplateCollection | GetGithubAppInstallation | ReadChatConversation
export type ResourceToCreate = {
  'user-files': ProjectUserFileToCreate
  'template-collections': ProjectTemplateCollectionToCreate
  'github-installations': ProjectGithubInstallationToCreate
  'chat-conversations': ProjectChatConversationToCreate
}[ResourceType]

export interface ResourceMap {
  'user-files': ReadUserFile[]
  'template-collections': ReadTemplateCollection[]
  'github-installations': GetGithubAppInstallation[]
  'chat-conversations': ReadChatConversation[]
}

interface FileUploadData {
  files: File[]
  category: typeof context_file_category.enumValues[number]
  file_type: typeof context_file_type.enumValues[number]
}

interface ProjectImport extends ReadContextImport {
  files?: ReadContextFile[]
}

interface ApiError {
  response?: {
    status: number
    data: unknown
    _data?: {
      error?: string
      message?: string
    }
  }
}

export function useProjectResources() {
  const { user } = useUserSession()
  const isLoading = ref(false)
  const imports = ref<ProjectImport[]>([])
  const resources = ref<ResourceMap>({
    'user-files': [] as ReadUserFile[],
    'template-collections': [] as ReadTemplateCollection[],
    'github-installations': [] as GetGithubAppInstallation[],
    'chat-conversations': [] as ReadChatConversation[],
  })
  const availableResources = ref<ResourceMap>({
    'user-files': [] as ReadUserFile[],
    'template-collections': [] as ReadTemplateCollection[],
    'github-installations': [] as GetGithubAppInstallation[],
    'chat-conversations': [] as ReadChatConversation[],
  })

  const resourceEndpoints: Record<ResourceType, string> = {
    'user-files': 'files',
    'template-collections': 'collections',
    'github-installations': 'installations',
    'chat-conversations': 'chats',
  }

  function handleError(error: ApiError) {
    console.error('API Error:', error)
    const message = error.response?._data?.message || error.response?._data?.error || 'An error occurred'
    throw new Error(message)
  }

  async function fetchResources(projectId: number, resourceType: ResourceType): Promise<void> {
    try {
      isLoading.value = true
      const response = await $fetch<ResourceMap[typeof resourceType]>(
        `/api/users/${user.value?.id}/projects/${projectId}/resources/${resourceType}`,
      )
      if (Array.isArray(response)) {
        switch (resourceType) {
          case 'user-files':
            resources.value['user-files'] = response as ReadUserFile[]
            break
          case 'template-collections':
            resources.value['template-collections'] = response as ReadTemplateCollection[]
            break
          case 'github-installations':
            resources.value['github-installations'] = response as GetGithubAppInstallation[]
            break
          case 'chat-conversations':
            resources.value['chat-conversations'] = response as ReadChatConversation[]
            break
        }
      }
    } catch (error) {
      handleError(error as ApiError)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function getResource(projectId: number, resourceType: ResourceType, resourceId: number): Promise<ResourceMap[typeof resourceType][number] | null> {
    try {
      const response = await $fetch<ResourceMap[typeof resourceType][number]>(
        `/api/users/${user.value?.id}/projects/${projectId}/resources/${resourceType}/${resourceId}`,
      )
      return response
    } catch (error) {
      handleError(error as ApiError)
      throw error
    }
  }

  async function linkResource(
    projectId: number,
    resourceType: ResourceType,
    data: ResourceToCreate,
  ): Promise<void> {
    try {
      await $fetch(`/api/users/${user.value?.id}/projects/${projectId}/resources/${resourceType}`, {
        method: 'POST',
        body: data,
      })
      await fetchResources(projectId, resourceType)
    } catch (error) {
      handleError(error as ApiError)
      throw error
    }
  }

  async function unlinkResource(
    projectId: number,
    resourceType: ResourceType,
    resourceId: number,
  ): Promise<void> {
    try {
      await $fetch(`/api/users/${user.value?.id}/projects/${projectId}/resources/${resourceType}/${resourceId}`, {
        method: 'DELETE',
      })
      switch (resourceType) {
        case 'user-files':
          resources.value['user-files'] = resources.value['user-files'].filter(r => r.id !== resourceId)
          break
        case 'template-collections':
          resources.value['template-collections'] = resources.value['template-collections'].filter(r => r.id !== resourceId)
          break
        case 'github-installations':
          resources.value['github-installations'] = resources.value['github-installations'].filter(r => r.id !== resourceId)
          break
        case 'chat-conversations':
          resources.value['chat-conversations'] = resources.value['chat-conversations'].filter(r => r.id !== resourceId)
          break
      }
    } catch (error) {
      handleError(error as ApiError)
      throw error
    }
  }

  async function fetchImportsWithFiles(projectId: number) {
    try {
      isLoading.value = true

      const importsResponse = await $fetch<ReadContextImport[]>(
        `/api/users/${user.value?.id}/projects/${projectId}/resources/imports`,
      )

      const files = await $fetch<ReadContextFile[]>(
        `/api/users/${user.value?.id}/projects/${projectId}/resources/files`,
      )

      const importsWithFiles = importsResponse.map(import_ => ({
        ...import_,
        files: files.filter(file => file.import_id === import_.id),
      }))

      imports.value = importsWithFiles
    } catch (error) {
      console.error('Failed to fetch imports with files:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function createImport(projectId: number) {
    const userId = user.value?.id
    if (!userId) {
      throw new Error('User not found')
    }

    const response = await $fetch<ReadContextImport>(
      `/api/users/${userId}/projects/${projectId}/resources/imports`,
      {
        method: 'POST',
        body: {
          neptun_user_id: userId,
          project_id: projectId,
          source_type: 'local_folder',
          source_path: '/',
          source_ref: '',
          import_status: 'pending',
          error_message: null,
          file_tree: {},
        },
      },
    )
    return response.id
  }

  async function updateImport(projectId: number, importId: number, updates: Partial<ReadContextImport>) {
    try {
      isLoading.value = true
      await $fetch(
        `/api/users/${user.value?.id}/projects/${projectId}/resources/imports/${importId}`,
        {
          method: 'PUT',
          body: updates,
        },
      )
      await fetchImportsWithFiles(projectId)
    } catch (error) {
      console.error('Failed to update import:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function uploadFiles(projectId: number, { files, category, file_type }: FileUploadData, existingImportId?: number) {
    try {
      isLoading.value = true

      const userId = user.value?.id
      if (!userId) {
        throw new Error('User not found')
      }

      const importId = existingImportId || await createImport(projectId)

      const filePromises = files.map(async (file: File) => {
        const rawContent = await file.text()

        // TODO: This is a temporary solution to prevent XSS attacks. We need to find a better solution in the future.
        const content = rawContent
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')

        const title = file.name
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')

        return linkFile(projectId, {
          title,
          original_path: title,
          content,
          file_type,
          category,
          file_size: file.size,
          language: 'text',
          metadata: null,
          pdf_url: null,
          parent_path: '/',
          depth: 0,
          neptun_user_id: userId,
          import_id: importId,
          project_id: projectId,
        })
      })

      await Promise.all(filePromises)

      await updateImport(projectId, importId, {
        import_status: 'completed',
      })

      await fetchImportsWithFiles(projectId)
    } catch (error) {
      console.error('Failed to upload files:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function linkFile(projectId: number, fileData: ContextFileToCreate) {
    try {
      isLoading.value = true

      console.log('Sending request body:', JSON.stringify(fileData, null, 2))

      const userId = user.value?.id
      if (!userId) {
        throw new Error('User not found')
      }

      await $fetch(`/api/users/${userId}/projects/${projectId}/resources/files`, {
        method: 'POST',
        body: fileData,
      })
    } catch (error) {
      const apiError = error as ApiError
      if (apiError?.response) {
        console.error('Server response:', {
          status: apiError.response.status,
          data: apiError.response.data,
          error: apiError.response._data?.error,
          message: apiError.response._data?.message,
        })
      }
      console.error('Failed to link file:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function unlinkFile(projectId: number, fileId: number) {
    try {
      isLoading.value = true
      await $fetch(
        `/api/users/${user.value?.id}/projects/${projectId}/resources/files/${fileId}`,
        { method: 'DELETE' },
      )
      await fetchImportsWithFiles(projectId)
    } catch (error) {
      console.error('Failed to unlink file:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function updateFile(projectId: number, fileId: number, updates: Partial<ReadContextFile>) {
    try {
      isLoading.value = true
      await $fetch(
        `/api/users/${user.value?.id}/projects/${projectId}/resources/files/${fileId}`,
        {
          method: 'PUT',
          body: updates,
        },
      )
      await fetchImportsWithFiles(projectId)
    } catch (error) {
      console.error('Failed to update file:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function deleteImport(projectId: number, importId: number) {
    try {
      isLoading.value = true
      await $fetch(
        `/api/users/${user.value?.id}/projects/${projectId}/resources/imports/${importId}`,
        { method: 'DELETE' },
      )
      await fetchImportsWithFiles(projectId)
    } catch (error) {
      console.error('Failed to delete import:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function fetchAvailableResources(resourceType: ResourceType): Promise<void> {
    try {
      isLoading.value = true
      const response = await $fetch<
        | ResourceMap[typeof resourceType]
        | { chats: ReadChatConversation[] }
        | { collections: ReadTemplateCollection[] }
      >(
        `/api/users/${user.value?.id}/${resourceEndpoints[resourceType]}`,
      )

      const data = resourceType === 'chat-conversations' && 'chats' in response
        ? response.chats
        : resourceType === 'template-collections' && 'collections' in response
          ? response.collections
          : response as ResourceMap[typeof resourceType]

      if (Array.isArray(data)) {
        switch (resourceType) {
          case 'user-files':
            availableResources.value['user-files'] = data as ReadUserFile[]
            break
          case 'template-collections':
            availableResources.value['template-collections'] = data as ReadTemplateCollection[]
            break
          case 'github-installations':
            availableResources.value['github-installations'] = data as GetGithubAppInstallation[]
            break
          case 'chat-conversations':
            availableResources.value['chat-conversations'] = data as ReadChatConversation[]
            break
        }
      }
    } catch (error) {
      handleError(error as ApiError)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    imports,
    resources,
    availableResources,
    fetchImportsWithFiles,
    unlinkFile,
    updateFile,
    uploadFiles,
    deleteImport,
    createImport,
    fetchResources,
    fetchAvailableResources,
    getResource,
    linkResource,
    unlinkResource,
  }
}
