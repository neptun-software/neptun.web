<script setup lang="ts">
import type { TemplateCollectionWithTemplatesWithoutIds as TemplateData } from '~/components/pages/templates/(shared)/types'

const { totalItems, isLoading, fetchPaginatedData, refreshData } = useTemplates()
const data = ref<TemplateData[]>([])
const pageSize = ref(2)
const page = ref(1)

// Watch totalItems to ensure pagination is updated when data is loaded
watch(totalItems, (newValue) => {
  if (newValue > 0) {
    fetchPaginatedData(page.value, pageSize.value, data)
  }
})

const { currentPage, pageCount, isFirstPage, isLastPage, prev, next }
  = useOffsetPagination({
    total: computed(() => totalItems.value),
    page,
    pageSize,
    onPageChange: ({ currentPage, currentPageSize }) => {
      fetchPaginatedData(currentPage, currentPageSize, data)
    },
    onPageSizeChange: ({ currentPage, currentPageSize }) => {
      fetchPaginatedData(currentPage, currentPageSize, data)
    },
  })

async function refresh() {
  return refreshData().then(() => fetchPaginatedData(page.value, pageSize.value, data))
}

defineExpose({ refresh })

onMounted(async () => {
  await fetchPaginatedData(page.value, pageSize.value, data)
})
</script>

<template>
  <div v-if="data.length > 0">
    <div class="flex gap-1 mb-2">
      <ShadcnButton :disabled="isFirstPage" @click="prev">
        prev
      </ShadcnButton>
      <ShadcnButton
        v-for="(item, index) in pageCount"
        :key="index"
        :disabled="currentPage === item"
        @click="currentPage = item"
      >
        {{ item }}
      </ShadcnButton>
      <ShadcnButton :disabled="isLastPage" @click="next">
        next
      </ShadcnButton>
    </div>

    <CollectionTemplateList :collections="data" :is-loading="isLoading" />
  </div>
  <div v-else>
    <p>No templates found</p>
  </div>
</template>

<style scoped></style>
