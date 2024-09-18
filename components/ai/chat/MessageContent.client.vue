<script lang="ts" setup>
defineProps<{
  content: string;
}>();
</script>

<template>
  <div>
    <MDC
      v-if="(content?.length ?? 0) > 0"
      class="break-words whitespace-pre-wrap"
      :value="content"
    />
    <div class="break-words whitespace-pre-wrap" v-else>
      {{ content }}
    </div>
  </div>
</template>

<style scoped></style>
