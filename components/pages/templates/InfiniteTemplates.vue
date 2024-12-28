<script setup lang="ts">
import type { TemplateCollectionWithTemplatesWithoutIds as TemplateData } from '~/components/pages/templates/(shared)/types'

const { totalItems, isLoading, fetchInfiniteData, refreshData } = useTemplates()
const data = ref<TemplateData[]>([])
const pageSize = ref(2)
const page = ref(1)

async function refresh() {
  data.value = []
  page.value = 1
  return refreshData().then(() => loadMore())
}

defineExpose({ refresh })

async function loadMore() {
  const hasMoreData = await fetchInfiniteData(page.value, pageSize.value, data)
  if (hasMoreData) {
    page.value += 1
  }
}

useInfiniteScroll(document, loadMore, {
  distance: 100,
})
</script>

<template>
  <div v-if="data.length > 0">
    <CollectionTemplateList :collections="data" :is-loading="isLoading" />

    <div
      v-if="!isLoading && data.length > 0 && data.length === totalItems"
      class="flex items-center justify-center gap-2 px-3 py-2 mt-2 border border-blue-200 rounded-lg bg-background"
    >
      <p>You scrolled to the bottom. No more templates to load...</p>
    </div>
  </div>
  <div v-else>
    <p>No templates found</p>
  </div>
</template>

<style scoped></style>
