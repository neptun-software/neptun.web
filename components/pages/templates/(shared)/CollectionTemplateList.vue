<script lang="ts" setup>
import type { TemplateCollectionWithTemplatesWithoutIds as TemplateData } from './types'

defineProps<{
  collections: TemplateData[]
  isLoading: boolean
}>()
</script>

<template>
  <div>
    <InfoBlock show-loader show-dots :is-visible="isLoading" class="mt-0 mb-2">
      Loading templates
    </InfoBlock>

    <div
      v-if="collections.length > 0"
      class="grid grid-cols-1 gap-2 lg:grid-cols-2"
    >
      <CollectionTemplate
        v-for="(collection, collectionIndex) in collections"
        :key="collectionIndex"
        :collection="collection"
      />
    </div>
  </div>
</template>

<style scoped></style>
