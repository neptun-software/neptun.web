import type { AsyncDataRequestStatus } from '#app'
import type { FetchError } from 'ofetch'
import type { TemplateCollectionWithTemplates } from '~/components/pages/templates/(shared)/types'
import type {
  TemplateCollectionToCreate,
  TemplateToCreate,
  UserFileToCreate,
} from '~/lib/types/database.tables/schema'

// TODO:
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
        text: escapedText, // Use escaped text
        language: fileData.language || 'text',
        extension: fileData.extension || 'txt',
      }

      const response = await $fetch(`/api/shared/collections/${collection.share_uuid}/templates`, {
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

      const response = await $fetch(`/api/shared/collections/${collection.share_uuid}/templates/${templateId}`, {
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

      await $fetch(`/api/shared/collections/${collection.share_uuid}/templates/${templateId}`, {
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
