<script lang="ts" setup>
defineProps<{
  isLast?: boolean
}>()
</script>

<template>
  <div class="overflow-hidden">
    <h2 class="my-2 text-xl font-bold">
      <slot name="header" />
    </h2>
    <slot name="content" />
    <ShadcnSeparator v-if="!isLast" class="h-1 my-2" />
    <div v-if="isLast" class="h-1 my-2" />
  </div>
</template>

<style scoped></style>
