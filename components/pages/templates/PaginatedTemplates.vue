<script setup lang="ts">
import type { TemplateCollectionWithTemplatesWithoutIds as TemplateData } from '~/components/pages/templates/(shared)/types'

const { totalItems, isLoading, fetchPaginatedData } = useTemplates()
const data = ref<TemplateData[]>([])
const pageSize = ref(2)
const page = ref(1)

fetchPaginatedData(page.value, pageSize.value, data)

const { currentPage, pageCount, isFirstPage, isLastPage, prev, next }
  = useOffsetPagination({
    total: totalItems.value,
    page,
    pageSize,
    onPageChange: ({ currentPage, currentPageSize }) => {
      fetchPaginatedData(currentPage, currentPageSize, data)
    },
    onPageSizeChange: ({ currentPage, currentPageSize }) => {
      fetchPaginatedData(currentPage, currentPageSize, data)
    },
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

    <Templates :collections="data" :is-loading="isLoading" />
  </div>
  <div v-else>
    <p>No templates found</p>
  </div>
</template>

<style scoped></style>
