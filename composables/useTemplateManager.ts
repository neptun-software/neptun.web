import type { AsyncDataRequestStatus } from '#app'
import type { FetchError } from 'ofetch'
import type {
  TemplateCollectionToCreate,
} from '~/lib/types/database.tables/schema'

interface Template {
  title: string | null | undefined
  text: string | undefined
  language: string
  extension: string
  id: number
  created_at: Date | null
  updated_at: Date | null
  description: string | null
  file_name: string
  neptun_user_file: any | null
}

interface TemplateCollection {
  id: number
  name: string
  description: string
  is_shared: boolean
  share_uuid: string
  // created_at: Date | null
  // updated_at: Date | null
  // neptun_user_id: number
  templates: Template[]
}

// TODO: improve typing (goal: no linting errors) and
// move collection mutation endpoints to users/ (protect them),
// only update state if update was successful
// implement templates CRUD

export function useTemplateManager() {
  const showShared = useState<boolean | null>('template-manager-show-shared', () => null)
  const collections = useState<TemplateCollection[]>('template-manager-collections', () => [])
  const fetchStatus = useState<AsyncDataRequestStatus>('template-manager-status', () => 'pending')
  const fetchError = useState<FetchError | null>('template-manager-error', () => null)

  const query = computed(() =>
    showShared.value !== null ? { is_shared: String(showShared.value) } : {},
  )

  async function readCollections() {
    try {
      fetchStatus.value = 'pending'
      const response = await $fetch('/api/shared/collections', {
        method: 'GET',
        query: query.value,
      })

      if (!response?.collections) {
        collections.value = []
        return
      }

      collections.value = response.collections.map((collection: any) => ({
        ...collection,
        description: collection.description || '',
        is_shared: Boolean(collection.is_shared),
        templates: collection.templates.map((template: any) => ({
          ...template,
          created_at: template.created_at ? new Date(template.created_at) : null,
          updated_at: template.updated_at ? new Date(template.updated_at) : null,
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
      const updatedCollection = await $fetch(`/api/shared/collections/${share_uuid}`, {
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
      await $fetch(`/api/shared/collections/${share_uuid}`, {
        method: 'DELETE',
      })

      collections.value = collections.value.filter(c => c.share_uuid !== share_uuid)
    } catch (error) {
      console.error('Failed to delete collection!')
    }
  }

  async function createNewCollection(collection: TemplateCollectionToCreate) {
    try {
      const response = await $fetch('/api/shared/collections', {
        method: 'POST',
        body: collection,
      })

      const newCollection = response.collection

      collections.value = [...collections.value, {
        ...newCollection,
        templates: [],
        description: newCollection.description || '',
      }]
    } catch (error) {
      console.error('Failed to create collection!')
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
  }
}
