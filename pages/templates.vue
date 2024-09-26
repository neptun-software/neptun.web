<script lang="ts" setup>
definePageMeta({
  name: 'Templates',
  alias: ['/snippets', '/shared']
})

// defineOgImageComponent('NuxtSeo');
</script>

<template>
  <div class="p-4">
    <ShadcnTabs
      default-value="paginated-pages"
      class="w-full"
    >
      <ShadcnTabsList class="flex justify-start flex-grow">
        <ShadcnTabsTrigger value="paginated-pages">
          Paginated Pages
        </ShadcnTabsTrigger>
        <ShadcnTabsTrigger value="infinite-scroll">
          Infinite Scroll
        </ShadcnTabsTrigger>
      </ShadcnTabsList>
      <ShadcnTabsContent
        value="paginated-pages"
        class="p-4 border rounded-md"
      >
        <PaginatedTemplates />
      </ShadcnTabsContent>
      <ShadcnTabsContent
        value="infinite-scroll"
        class="p-4 border rounded-md"
      >
        <InfiniteTemplates />
      </ShadcnTabsContent>
    </ShadcnTabs>
  </div>
</template>

<style scoped></style>
