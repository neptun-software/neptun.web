<script lang="ts" setup>
defineProps<{
  content: string
  uniqueKey: string
}>()
</script>

<template>
  <div>
    <MarkdownRenderer :content="content" :unique-key="uniqueKey" />
  </div>
</template>

<style lang="postcss" scoped>
:deep(details) {
  @apply bg-secondary rounded-md p-2;
}

:deep(summary) {
  @apply cursor-pointer;
  -webkit-user-select: none; /* Safari */
  -ms-user-select: none; /* IE 10 and IE 11 */
  user-select: none;
}

:deep(details + *) {
  @apply mt-4;
}
</style>
