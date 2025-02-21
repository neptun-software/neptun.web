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

    <div class="mt-2">
      <InfoBlock :is-visible="isLoading" show-loader show-dots class="mb-0">
        Loading more templates
      </InfoBlock>

      <InfoBlock :is-visible="!isLoading && data.length > 0 && data.length === totalItems" class="mb-0">
        You scrolled to the bottom. No more templates to load...
      </InfoBlock>
    </div>
  </div>

  <div v-else class="mt-2">
    <InfoBlock :is-visible="true" class="mb-0">
      No templates found
    </InfoBlock>
  </div>
</template>

<style scoped></style>
