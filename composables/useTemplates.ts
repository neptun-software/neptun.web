import { type TemplateData, templates } from '../lib/(templates)/templates'

export function useTemplates() {
  const database = useState<TemplateData[]>('project-template-list', () => [])
  const isLoading = useState<boolean>('project-template-list-is-loading', () => false)
  const totalItems = computed(() => database.value.length)

  async function fetchTemplateData(page: number, pageSize: number): Promise<TemplateData[]> {
    try {
      const start = (page - 1) * pageSize
      const end = start + pageSize

      const { data } = await useFetch('/api/shared/collections')
      if (data.value?.collections) {
        const allTemplates = data.value.collections.flatMap(collection => 
          collection.templates.map(template => ({
            id: template.id,
            name: template.file_name,
            author: collection.name,
            code: [{
              fileName: template.file_name,
              code: template.text || ''
            }],
            readme: template.description || '',
            collectionName: collection.name,
            collectionId: collection.id,
          }))
        )
        database.value = allTemplates

        const actualEnd = Math.min(end, allTemplates.length)
        return allTemplates.slice(start, actualEnd)
      }

      return []
    } catch (error) {
      console.error('Error fetching template data:', error)
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
