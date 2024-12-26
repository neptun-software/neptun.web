import { recommendedCollections, type TemplateData } from '../lib/(templates)/templates'

export function useTemplates() {
  const database = useState<TemplateData[]>('project-template-list', () => [])
  const isLoading = useState<boolean>('project-template-list-is-loading', () => false)
  const totalItems = useState<number>('project-template-item-amount', () => 0)

  async function fetchTemplateData(page: number, pageSize: number): Promise<TemplateData[]> {
    try {
      const start = (page - 1) * pageSize
      const end = start + pageSize

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
        }))
      ].filter(collection => collection.templates.length > 0)

      database.value = allTemplates
      totalItems.value = allTemplates.length

      const actualEnd = Math.min(end, totalItems.value)
      return database.value.slice(start, actualEnd)
    } catch (error) {
      console.error('Error fetching template data!')
      return []
    }
  }

  async function fetchInfiniteData(
    page: number,
    pageSize: number,
    existingData: Ref<TemplateData[]>,
  ) {
    if (isLoading.value || existingData.value.length >= database.value.length) {
      return false
    }

    isLoading.value = true
    try {
      const newData = await fetchTemplateData(page, pageSize)
      if (newData.length > 0) {
        existingData.value = [...existingData.value, ...newData]
        return true
      }
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
      const newData = await fetchTemplateData(page, pageSize)
      targetData.value = newData
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
  }
}
