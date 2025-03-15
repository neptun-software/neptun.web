<script setup lang="ts">
import type { TemplateCollectionWithTemplatesWithoutIds as TemplateData } from '~/components/pages/templates/(shared)/types'

const { totalItems, isLoading, fetchInfiniteData, refreshData } = useTemplates()
const data = ref<TemplateData[]>([])
const pageSize = ref(2)
const page = ref(1)
const isInitialized = ref(false)

async function refresh() {
  data.value = []
  page.value = 1
  isInitialized.value = false
  await refreshData()
  await loadMore()
  isInitialized.value = true
}

defineExpose({ refresh })

async function loadMore() {
  if (!isInitialized.value && data.value.length > 0) {
    return
  }

  const hasMoreData = await fetchInfiniteData(page.value, pageSize.value, data)
  if (hasMoreData) {
    page.value += 1
  }
}

onMounted(async () => {
  await refresh()
})

useInfiniteScroll(document, async () => {
  await loadMore()
}, {
  distance: 100,
})
</script>

<template>
  <div>
    <CollectionTemplateList :collections="data" :is-loading="isLoading" />

    <div v-if="data.length > 0" class="mt-2">
      <InfoBlock :is-visible="!isLoading && data.length === totalItems" class="mb-0">
        You scrolled to the bottom. No more templates to load...
      </InfoBlock>
    </div>

    <div v-else-if="!isLoading" class="mt-2">
      <InfoBlock :is-visible="true" class="mb-0">
        No templates found
      </InfoBlock>
    </div>
  </div>
</template>

<style scoped></style>
