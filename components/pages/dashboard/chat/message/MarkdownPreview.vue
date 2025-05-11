<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'
import { createApp, h, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import CodeBlock from './CodeBlock.vue'

const props = defineProps<{
  markdown?: string
  textStream?: ReadableStream<string>
}>()

const emit = defineEmits(['ready'])
const renderedContent = ref('')
const rawContent = ref('') // show raw content while worker initializes
const previewElement = ref<HTMLElement | null>(null)
let markdownWorker: Worker | null = null
let renderTimeout: number | null = null
let codeBlockCounter = 0 // counter for unique code block IDs
let workerReady = false

const { isDarkMode, selectedTheme } = useTheme()

function initWorker() {
  console.log('Initializing markdown worker...')
  try {
    markdownWorker = new Worker(new URL('./markdown.worker.ts', import.meta.url), { type: 'module' })
    
    markdownWorker.onerror = (error) => {
      console.error('Worker error:', error)
    }

    markdownWorker.onmessage = (event) => {
      console.log('Received message from worker:', event.data)
      if (event.data.action === 'ready') {
        console.log('Worker is ready')
        workerReady = true
        // re-render any content we received while waiting
        if (rawContent.value) {
          console.log('Rendering markdown that was waiting')
          renderMarkdown(rawContent.value)
        }
        return
      }

      const { html, success, error } = event.data

      if (!success) {
        console.error('Worker error:', error)
        emit('ready')
        return
      }

      console.log('Setting rendered content')
      renderedContent.value = html

      // process code blocks after HTML is rendered
      nextTick(() => {
        replaceCodeBlockPlaceholders()
      })
    }
  } catch (err) {
    console.error('Error initializing worker:', err)
  }
}

function renderMarkdown(markdown: string | undefined) {
  if (!markdown) {
    console.log('No markdown to render')
    return
  }

  console.log('Setting raw content', markdown.substring(0, 50) + '...')
  rawContent.value = markdown
  
  if (!markdownWorker) {
    console.log('Worker not initialized')
    return
  }
  
  if (!workerReady) {
    console.log('Worker not ready yet')
    return
  }

  // for streaming, don't debounce initial content
  const delay = props.textStream ? (renderedContent.value ? 50 : 0) : 100

  if (renderTimeout) {
    clearTimeout(renderTimeout)
  }

  console.log('Scheduling markdown render with delay:', delay)
  renderTimeout = window.setTimeout(() => {
    console.log('Sending markdown to worker')
    markdownWorker?.postMessage({
      markdown,
      isDarkMode: isDarkMode.value,
    })
  }, delay)
}

function replaceCodeBlockPlaceholders() {
  if (!previewElement.value) {
    emit('ready')
    return
  }

  const placeholders = previewElement.value.querySelectorAll('.code-block-placeholder')

  if (placeholders.length === 0) {
    emit('ready')
    return
  }

  placeholders.forEach((placeholder) => {
    const language = placeholder.getAttribute('data-language') || 'text'
    const content = placeholder.getAttribute('data-content')
      ? decodeURIComponent(placeholder.getAttribute('data-content') || '')
      : ''

    const blockId = `code-block-${codeBlockCounter++}`

    const container = document.createElement('div')
    placeholder.replaceWith(container)

    const app = createApp({
      render: () => h(CodeBlock, {
        language,
        extension: language,
        title: `Code Block ${blockId}`,
        content,
        theme: selectedTheme.value,
        blockId,
      }),
    })

    app.mount(container)
  })

  emit('ready')
}

async function handleStream(stream: ReadableStream<string>) {
  const reader = stream.getReader()
  let buffer = ''

  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) {
        break
      }

      buffer += value
      renderMarkdown(buffer)
    }
  } catch (error) {
    console.error('Error reading stream:', error)
  } finally {
    reader.releaseLock()
    emit('ready')
  }
}

onMounted(() => {
  initWorker()

  if (props.textStream) {
    handleStream(props.textStream)
  } else if (props.markdown) {
    renderMarkdown(props.markdown)
  }

  watch(() => props.markdown, (newContent) => {
    if (newContent && !props.textStream) {
      renderMarkdown(newContent)
    }
  })

  watch(() => props.textStream, (newStream) => {
    if (newStream) {
      renderedContent.value = ''
      rawContent.value = ''
      handleStream(newStream)
    }
  })

  watch(() => isDarkMode.value, () => {
    const content = renderedContent.value || rawContent.value
    if (content) {
      renderMarkdown(content)
    }
  })
})

onBeforeUnmount(() => {
  if (markdownWorker) {
    markdownWorker.terminate()
  }

  if (renderTimeout) {
    clearTimeout(renderTimeout)
  }
})
</script>

<template>
  <div ref="previewElement" class="markdown-preview prose dark:prose-invert">
    <!-- Show raw content while waiting for worker -->
    <div v-if="!renderedContent && rawContent" class="whitespace-pre-wrap">
      {{ rawContent }}
    </div>
    <!-- Show rendered content once available -->
    <div v-else v-html="renderedContent" />
  </div>
</template>

<style lang="postcss">
</style>
