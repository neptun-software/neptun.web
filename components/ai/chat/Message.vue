<script lang="ts" setup>
import type { Message } from '@ai-sdk/vue';

defineProps<{
  message: Message;
}>();
</script>

<template>
  <div
    class="flex max-w-full my-2 prose text-foreground"
    v-bind:class="{
      'justify-start': message.role === 'assistant',
      'justify-end': message.role === 'user',
    }"
  >
    <div
      v-if="message.role === 'assistant'"
      class="px-4 py-2 border rounded-lg bg-background border-slate-200 max-w-[80%] relative dark:border-border"
      :id="`message-${message.id}`"
      :data-message-created-at="message.createdAt"
    >
      <ClientOnly>
        <MDC
          class="overflow-x-auto break-words whitespace-pre-wrap"
          :value="message.content"
        />
      </ClientOnly>
      <ShadcnSeparator class="my-4" label="Controls" />
      <AiChatMessageControls
        :message="message.content"
        :key="message.content"
      />
    </div>

    <div
      v-if="message.role === 'user'"
      class="px-4 py-2 border rounded-lg bg-background border-slate-200 max-w-[80%] dark:border-border"
      :id="`message-${message.id}`"
      :data-message-created-at="message.createdAt"
    >
      <ClientOnly>
        <MDC :value="message.content" />
      </ClientOnly>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
:deep(pre.shiki) {
  @apply bg-primary/10;
  margin: 0.25rem 0;
}

:deep(div :is(*:last-child)) {
  margin-bottom: 0;
  padding-bottom: 0;
}

:deep(div :is(*:first-child)) {
  margin-top: 0;
  padding-top: 0;
}
</style>
