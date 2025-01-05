import type { AsyncDataRequestStatus } from '#app'
import type { FetchError } from 'ofetch'
import type { TemplateCollectionWithTemplates, TemplateCollectionWithTemplatesWithoutIds as TemplateData } from '~/components/pages/templates/(shared)/types'

import type {
  TemplateCollectionToCreate,
  TemplateToCreate,
  UserFileToCreate,
} from '~/lib/types/database.tables/schema'
import { recommendedCollections } from '../components/pages/templates/(shared)/data'

// TODO: only update client-state if server-update was successful

/**
 * Provides a composable function for managing and fetching template collections.
 *
 * This function manages state for a list of template collections, loading status,
 * and total number of template collections. It also provides methods to fetch
 * template collections in a paginated manner, create new ones, update existing
 * ones, and delete existing ones.
 *
 * State:
 * - `showShared`: a global reactive boolean state indicating whether to show
 *   shared collections or not.
 * - `collections`: a global reactive array state containing the list of template
 *   collections.
 * - `fetchStatus`: a global reactive state indicating the loading status of
 *   template collections.
 * - `fetchError`: a global reactive state containing the error from the last
 *   fetch.
 *
 * Methods:
 * - `readCollections()`: Fetches the list of template collections in a paginated
 *   manner, using the `showShared` state to determine whether to fetch shared
 *   or private collections.
 * - `createNewCollection(...)`: Creates a new
 *   template collection.
 * - `updateCollection(...)`: Updates
 *   a template collection.
 * - `deleteCollection(...)`: Deletes a template collection.
 * - `createTemplate(...)`: Creates a new template in a specified collection.
 * - `updateTemplate(...)`: Updates a
 *   template.
 * - `deleteTemplate(...)`: Deletes a template.
 *
 * Usage:
 * Call this function within a setup() function of a Vue component to gain access to template
 * collection management and fetching capabilities.
 */
export function useTemplateManager() {
  const showShared = useState<boolean | null>('template-manager-show-shared', () => null)
  const collections = useState<TemplateCollectionWithTemplates[]>('template-manager-collections', () => [])
  const fetchStatus = useState<AsyncDataRequestStatus>('template-manager-status', () => 'pending')
  const fetchError = useState<FetchError | null>('template-manager-error', () => null)
  const { user } = useUserSession()

  const query = computed(() =>
    showShared.value !== null ? { is_shared: showShared.value } : {},
  )

  async function readCollections() {
    try {
      fetchStatus.value = 'pending'
      const response = await $fetch(`/api/users/${user.value?.id}/collections`, {
        method: 'GET',
        query: query.value,
      })

      if (!response?.collections) {
        collections.value = []
        return
      }

      collections.value = response.collections.map(collection => ({
        ...collection,
        description: collection.description || '',
        is_shared: Boolean(collection.is_shared),
        created_at: collection.created_at ? new Date(collection.created_at) : null,
        updated_at: collection.updated_at ? new Date(collection.updated_at) : null,
        templates: collection.templates.map(template => ({
          ...template,
          text: template.text || '',
          title: template.title || '',
          created_at: template.created_at ? new Date(template.created_at) : null,
          updated_at: template.updated_at ? new Date(template.updated_at) : null,
          template_collection_id: collection.id,
          user_file_id: template.neptun_user_file?.id ?? null,
        })),
      }))
      fetchStatus.value = 'success'
    } catch (error: any) {
      fetchError.value = error
      fetchStatus.value = 'error'
    }
  }

  async function updateCollection(share_uuid: string, data: TemplateCollectionToCreate) {
    if (!share_uuid) {
      return
    }

    try {
      const updatedCollection = await $fetch(`/api/users/${user.value?.id}/collections/${share_uuid}`, {
        method: 'PATCH',
        body: data,
      })

      const index = collections.value.findIndex(c => c.share_uuid === share_uuid)
      if (index !== -1) {
        collections.value[index] = {
          ...collections.value[index],
          ...updatedCollection,
        }
      }
    } catch (error) {
      console.error('Failed to update collection!')
    }
  }

  async function deleteCollection(share_uuid: string) {
    try {
      await $fetch(`/api/users/${user.value?.id}/collections/${share_uuid}`, {
        method: 'DELETE',
      })

      collections.value = collections.value.filter(c => c.share_uuid !== share_uuid)
    } catch (error) {
      console.error('Failed to delete collection!')
    }
  }

  async function createNewCollection(collection: TemplateCollectionToCreate) {
    try {
      const response = await $fetch(`/api/users/${user.value?.id}/collections`, {
        method: 'POST',
        body: collection,
      })

      const newCollection = response.collection
      collections.value = [...collections.value, {
        ...newCollection,
        description: newCollection.description || '',
        created_at: newCollection.created_at ? new Date(newCollection.created_at) : null,
        updated_at: newCollection.updated_at ? new Date(newCollection.updated_at) : null,
        templates: [] as TemplateCollectionWithTemplates['templates'],
      }]

      return newCollection
    } catch (error) {
      console.error('Failed to create collection!')
    }
  }

  async function createTemplate(collectionId: number, templateData: TemplateToCreate, fileData: UserFileToCreate) {
    try {
      const collection = collections.value.find(c => c.id === collectionId)
      if (!collection?.share_uuid) {
        console.error('Collection not found!')
        return
      }

      // Escape HTML-like content in the text (XSS n shit (searched for about 2 hours till i found out, that this was the problem...))
      const escapedText = fileData.text
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')

      const template = {
        neptun_user_id: templateData.neptun_user_id,
        file_name: templateData.file_name,
        description: templateData.description || '',
      }

      const file = {
        neptun_user_id: templateData.neptun_user_id,
        title: fileData.title || templateData.file_name,
        text: escapedText,
        language: fileData.language || 'text',
        extension: fileData.extension || 'txt',
      }

      const response = await $fetch(`/api/users/${user.value?.id}/collections/${collection.share_uuid}/templates`, {
        method: 'POST',
        body: {
          template,
          file,
        },
      })

      if (response?.template) {
        const collectionIndex = collections.value.findIndex(c => c.id === collectionId)
        if (collectionIndex !== -1) {
          collections.value[collectionIndex].templates.push({
            ...response.template,
            created_at: response.template.created_at ? new Date(response.template.created_at) : null,
            updated_at: response.template.updated_at ? new Date(response.template.updated_at) : null,
          })
        }
        return response.template
      }
    } catch (error) {
      console.error('Failed to create template!')
    }
  }

  async function updateTemplate(templateId: number, data: Partial<TemplateToCreate>) {
    try {
      const collection = collections.value.find(c =>
        c.templates.some(t => t.id === templateId),
      )

      if (!collection?.share_uuid) {
        console.error('Collection not found!')
        return
      }

      const response = await $fetch(`/api/users/${user.value?.id}/collections/${collection.share_uuid}/templates/${templateId}`, {
        method: 'PATCH',
        body: data,
      })

      if (response?.template) {
        const collectionIndex = collections.value.findIndex(c => c.id === collection.id)
        const templateIndex = collections.value[collectionIndex].templates.findIndex(t => t.id === templateId)

        if (templateIndex !== -1) {
          collections.value[collectionIndex].templates[templateIndex] = {
            ...collections.value[collectionIndex].templates[templateIndex],
            ...response.template,
            created_at: response.template.created_at ? new Date(response.template.created_at) : null,
            updated_at: response.template.updated_at ? new Date(response.template.updated_at) : null,
          }
        }
      }
    } catch (error) {
      console.error('Failed to update template!')
    }
  }

  async function deleteTemplate(templateId: number) {
    try {
      const collection = collections.value.find(c =>
        c.templates.some(t => t.id === templateId),
      )

      if (!collection?.share_uuid) {
        console.error('Collection not found!')
        return
      }

      await $fetch(`/api/users/${user.value?.id}/collections/${collection.share_uuid}/templates/${templateId}`, {
        method: 'DELETE',
      })

      const collectionIndex = collections.value.findIndex(c => c.id === collection.id)
      collections.value[collectionIndex].templates = collections.value[collectionIndex].templates
        .filter(t => t.id !== templateId)
    } catch (error) {
      console.error('Failed to delete template!')
    }
  }

  return {
    collections,
    fetchStatus,
    fetchError,
    showShared,
    createNewCollection,
    readCollections,
    updateCollection,
    deleteCollection,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  }
}

/**
 * Provides a composable function for managing and fetching template data.
 *
 * This function manages state for a list of templates, loading status,
 * and total number of templates. It also provides methods to fetch
 * template data either in a paginated or infinite-scroll manner.
 *
 * State:
 * - `database`: a global reactive state containing the list of template data.
 * - `isLoading`: a global reactive boolean state indicating the loading status of template data.
 * - `totalItems`: a global reactive number state representing the total number of templates.
 *
 * Methods:
 * - `fetchTemplateData(...)`: Fetches template data for a specific page
 *   and page size, updates the `database` with all templates and returns the current page's data.
 * - `fetchInfiniteData(...)`: Fetches
 *   additional template data for infinite scrolling, appending new data to `existingData`.
 * - `fetchPaginatedData(...)`: Fetches
 *   template data for a specific page and updates `targetData` with the fetched data.
 *
 * Usage:
 * Call this function within a setup() function of a Vue component to gain access to template
 * data management and fetching capabilities.
 */
export function useTemplates() {
  const database = useState<TemplateData[]>('project-template-list', () => [])
  const isLoading = useState<boolean>('project-template-list-is-loading', () => false)
  const totalItems = useState<number>('project-template-list-length', () => 0)
  const isInitialized = useState<boolean>('project-template-list-initialized', () => false)

  async function initializeDatabase(force = false) {
    if (isInitialized.value && !force) {
      return
    }

    try {
      const { collections } = await $fetch('/api/shared/collections')

      const allTemplates = [
        ...recommendedCollections,
        ...collections.map(collection => ({
          ...collection,
          description: collection.description || '',
          created_at: collection.created_at ? new Date(collection.created_at) : null,
          updated_at: collection.updated_at ? new Date(collection.updated_at) : null,
          templates: collection.templates.map(template => ({
            id: template.id,
            description: template.description || '',
            file_name: template.file_name,
            title: template.title || template.file_name,
            text: template.text || '',
            language: template.language || 'text',
            extension: template.extension || 'txt',
            created_at: template.created_at ? new Date(template.created_at) : null,
            updated_at: template.updated_at ? new Date(template.updated_at) : null,
          })),
        })),
      ].filter(collection => collection.templates.length > 0)

      database.value = allTemplates
      await nextTick(() => {
        totalItems.value = allTemplates.length
      })
      isInitialized.value = true
    } catch (error) {
      console.error('Error fetching template data!')
      return []
    }
  }

  async function refreshData() {
    isInitialized.value = false
    await initializeDatabase(true)
  }

  async function fetchTemplateData(page: number, pageSize: number): Promise<TemplateData[]> {
    if (!isInitialized.value) {
      await initializeDatabase()
    }

    const start = (page - 1) * pageSize
    const end = Math.min(start + pageSize, totalItems.value)
    return database.value.slice(start, end)
  }

  async function fetchInfiniteData(
    page: number,
    pageSize: number,
    existingData: Ref<TemplateData[]>,
  ) {
    if (isLoading.value || existingData.value.length >= totalItems.value) {
      return false
    }

    isLoading.value = true
    try {
      if (!isInitialized.value) {
        await initializeDatabase()
      }

      const newData = await fetchTemplateData(page, pageSize)
      if (newData.length > 0) {
        existingData.value = [...existingData.value, ...newData]
        return true
      }
      return false
    } catch (error) {
      console.error('Error fetching infinite data!')
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function fetchPaginatedData(
    page: number,
    pageSize: number,
    targetData: Ref<TemplateData[]>,
  ) {
    isLoading.value = true
    try {
      if (!isInitialized.value) {
        await initializeDatabase()
      }

      targetData.value = await fetchTemplateData(page, pageSize)
    } catch (error) {
      console.error('Error fetching template data!')
    } finally {
      isLoading.value = false
    }
  }

  return {
    database,
    isLoading,
    totalItems,
    fetchTemplateData,
    fetchInfiniteData,
    fetchPaginatedData,
    refreshData,
  }
}
