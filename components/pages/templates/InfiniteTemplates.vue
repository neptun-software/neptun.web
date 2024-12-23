<script setup lang="ts">
import type { TemplateData } from '~/lib/(templates)/templates'

const { totalItems, isLoading, fetchInfiniteData } = useTemplates()
const data = ref<TemplateData[]>([])
const pageSize = ref(2)
const page = ref(1)

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
    <Templates :templates="data" :is-loading="isLoading" />

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
