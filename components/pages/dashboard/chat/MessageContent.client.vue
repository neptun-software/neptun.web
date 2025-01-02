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

<style lang="postcss" scoped></style>
