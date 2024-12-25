import type { AsyncDataRequestStatus } from '#app'
import type { FetchError } from 'ofetch'
import type { TemplateCollectionWithTemplates } from '~/components/pages/templates/(shared)/types'
import type {
  TemplateCollectionToCreate,
} from '~/lib/types/database.tables/schema'

// TODO:
// implement templates CRUD
// move collection mutation endpoints to `/users` and extend readAllTemplateCollections(allow fetching by userID) (protect them)
// only update client-state if server-update was successful

export function useTemplateManager() {
  const showShared = useState<boolean | null>('template-manager-show-shared', () => null)
  const collections = useState<TemplateCollectionWithTemplates[]>('template-manager-collections', () => [])
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
        description: newCollection.description || '',
        created_at: newCollection.created_at ? new Date(newCollection.created_at) : null,
        updated_at: newCollection.updated_at ? new Date(newCollection.updated_at) : null,
        templates: [] as TemplateCollectionWithTemplates['templates'],
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
