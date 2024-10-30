<script lang="ts" setup>
defineProps<{
  content: string
}>();
</script>

<template>
  <div>
    <MDC
      v-if="(content?.length ?? 0) > 0"
      class="break-words whitespace-pre-wrap"
      :value="content"
    />
    <div
      v-else
      class="break-words whitespace-pre-wrap"
    >
      {{ content }}
    </div>
  </div>
</template>

<style lang="postcss" scoped></style>
