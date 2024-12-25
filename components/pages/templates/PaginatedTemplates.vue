<script setup lang="ts">
import type { TemplateData } from '~/lib/(templates)/templates'

const { totalItems, isLoading, fetchPaginatedData } = useTemplates()
const templates = ref<TemplateData[]>([])
const pageSize = ref(2)
const page = ref(1)

fetchPaginatedData(page.value, pageSize.value, templates)

const { currentPage, pageCount, isFirstPage, isLastPage, prev, next }
  = useOffsetPagination({
    total: totalItems.value,
    page,
    pageSize,
    onPageChange: ({ currentPage, currentPageSize }) => {
      fetchPaginatedData(currentPage, currentPageSize, templates)
    },
    onPageSizeChange: ({ currentPage, currentPageSize }) => {
      fetchPaginatedData(currentPage, currentPageSize, templates)
    },
  })
</script>

<template>
  <div v-if="templates.length > 0">
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

    <Templates :templates="templates" :is-loading="isLoading" />
  </div>
  <div v-else>
    <p>No templates found</p>
  </div>
</template>

<style scoped></style>
