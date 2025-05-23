<script lang="ts" setup>
import type { Message } from '~/lib/types/models/chat'

const props = defineProps<{
  message: Message
}>()

const isMarkdownReady = ref(false)
const textStream = ref<ReadableStream<string> | undefined>(undefined)

watch(() => props.message.content, () => {
  isMarkdownReady.value = false
})

function handleMarkdownReady() {
  isMarkdownReady.value = true
}

watch(() => props.message.isStreaming, (isStreaming) => {
  if (isStreaming) {
    let content = props.message.content || ''

    textStream.value = new ReadableStream<string>({
      start(controller: ReadableStreamDefaultController<string>) {
        if (content) {
          controller.enqueue(content)
        }
      },
      pull(controller: ReadableStreamDefaultController<string>) {
        const newContent = props.message.content || ''
        if (newContent !== content) {
          const diff = newContent.slice(content.length)
          content = newContent
          controller.enqueue(diff)
        }

        if (!props.message.isStreaming) {
          controller.close()
        }
      },
    })
  } else {
    textStream.value = undefined
  }
})
</script>

<template>
  <div
    class="flex my-2 max-w-full prose dark:prose-invert text-foreground"
    :class="{
      'justify-start': message.role === 'assistant',
      'justify-end': message.role === 'user',
    }"
  >
    <div
      v-if="message.role === 'assistant'"
      :id="`message-${message.id}-assistant`"
      class="px-4 py-3 border rounded-lg bg-background border-slate-200 max-w-[80%] relative dark:border-border"
      :data-message-created-at="message.createdAt"
    >
      <!-- Show raw text while markdown is rendering and not streaming -->
      <div v-if="!isMarkdownReady && !message.isStreaming" class="mb-2 whitespace-pre-wrap">
        {{ message.content }}
      </div>

      <!-- Show preview when streaming or when ready -->
      <DashboardChatMessageMarkdownPreview
        :key="`preview-${message.id}`"
        :markdown="message.content"
        :text-stream="textStream"
        @ready="handleMarkdownReady"
      />

      <!-- Only show controls when not streaming -->
      <template v-if="!message.isStreaming">
        <ShadcnSeparator class="my-4" label="Controls" />
        <DashboardChatMessageControls
          :key="`controls-${message.id}`"
          :message="message.content"
        />
      </template>
    </div>

    <div
      v-if="message.role === 'user'"
      :id="`message-${message.id}-user`"
      class="px-4 py-3 border rounded-lg bg-background border-slate-200 max-w-[80%] dark:border-border"
      :data-message-created-at="message.createdAt"
    >
      {{ message.content }}
    </div>
  </div>
</template>

<style lang="postcss" scoped>
:deep(pre.shiki) {
  @apply bg-primary/10;
  margin: 0.25rem 0;
}
</style>

<!--
:deep(div :is(*:last-child)) {
  margin-bottom: 0;
  padding-bottom: 0;
}

:deep(div :is(*:first-child)) {
  margin-top: 0;
  padding-top: 0;
}
-->
