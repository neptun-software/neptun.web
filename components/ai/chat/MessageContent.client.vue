<script lang="ts" setup>
defineProps<{
  content: string
}>()
</script>

<template>
  <div>
    <MarkdownRenderer :content="content" />
  </div>
</template>

<style lang="postcss" scoped></style>
