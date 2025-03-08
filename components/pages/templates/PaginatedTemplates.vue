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
  data.value = []
  page.value = 1
  return refreshData().then(() => fetchPaginatedData(page.value, pageSize.value, data))
}

defineExpose({ refresh })

onMounted(async () => {
  await fetchPaginatedData(page.value, pageSize.value, data)
})
</script>

<template>
  <div v-if="isLoading && data.length === 0">
    <InfoBlock :is-visible="true" show-loader show-dots class="mb-0">
      Loading templates
    </InfoBlock>
  </div>

  <div v-else-if="data.length > 0">
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

    <CollectionTemplateList
      :key="`page-${currentPage}`"
      :collections="data"
      :is-loading="isLoading"
    />

    <InfoBlock
      :is-visible="isLoading"
      show-loader
      show-dots
      class="mb-0"
    >
      Loading templates
    </InfoBlock>
  </div>

  <div v-else>
    <InfoBlock :is-visible="true" class="mb-0">
      No templates found
    </InfoBlock>
  </div>
</template>

<style scoped></style>
