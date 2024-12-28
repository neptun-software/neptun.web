<script lang="ts" setup>
import type { Message } from '~/lib/types/models/chat'

const props = defineProps<{
  message: Message
}>()

const messageContent = computed(() => props.message.content)
</script>

<template>
  <div
    class="flex max-w-full my-2 prose dark:prose-invert text-foreground"
    :class="{
      'justify-start': message.role === 'assistant',
      'justify-end': message.role === 'user',
    }"
  >
    <div
      v-if="message.role === 'assistant'"
      :id="`message-${message.id}-assistant`"
      class="px-4 py-2 border rounded-lg bg-background border-slate-200 max-w-[80%] relative dark:border-border"
      :data-message-created-at="message.createdAt"
    >
      <template v-if="!message.isStreaming">
        <DashboardChatMessageContent :content="messageContent" />
        <ShadcnSeparator class="my-4" label="Controls" />
        <DashboardChatMessageControls
          :key="messageContent"
          :message="messageContent"
        />
      </template>
      <div v-else class="break-words whitespace-pre-wrap">
        {{ messageContent }}
      </div>
    </div>

    <div
      v-if="message.role === 'user'"
      :id="`message-${message.id}-user`"
      class="px-4 py-2 border rounded-lg bg-background border-slate-200 max-w-[80%] dark:border-border"
      :data-message-created-at="message.createdAt"
    >
      <DashboardChatMessageContent :content="messageContent" />
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
