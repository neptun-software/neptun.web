<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'
import { checkReady, renderMarkdown } from '#imports'
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
let renderTimeout: number | null = null
let codeBlockCounter = 0 // counter for unique code block IDs
const workerReady = ref(false)
const pendingContent = ref('')

const { isDarkMode, selectedTheme } = useTheme()

initWorker()

async function initWorker() {
  console.log('Initializing markdown worker...')
  try {
    const response = await checkReady()
    console.log('Worker initialized successfully:', response)
    workerReady.value = true
      
    if (pendingContent.value) {
      console.log('Processing pending content after worker initialization')
      processMarkdown(pendingContent.value)
      pendingContent.value = ''
    }
  } catch (err) {
    console.error('Error initializing worker:', err)
    if (pendingContent.value) {
      rawContent.value = pendingContent.value
      emit('ready')
    }
  }
}

async function processMarkdown(markdown: string | undefined) {
  if (!markdown) {
    console.log('No markdown to render')
    return
  }

  console.log('Processing markdown content:', `${markdown.substring(0, 50)}...`)
    
  pendingContent.value = markdown
    
  if (!workerReady.value) {
    console.log('Worker not ready yet - content will be processed when worker is ready')
    rawContent.value = markdown
    return
  }

  // for streaming, don't debounce initial content
  const delay = props.textStream ? (renderedContent.value ? 50 : 0) : 100

  if (renderTimeout) {
    clearTimeout(renderTimeout)
  }

  console.log('Scheduling markdown render with delay:', delay)
  renderTimeout = window.setTimeout(async () => {
    console.log('Rendering markdown with worker')
    try {
      // Note: nuxt-workers makes functions return promises even if they're synchronous in the worker
      const result = await renderMarkdown(markdown, isDarkMode.value)
      console.log('Worker result:', result)
      
      if (!result.success) {
        console.error('Worker error:', result.error)
        rawContent.value = markdown
        emit('ready')
        return
      }

      console.log('Setting rendered content')
      renderedContent.value = result.html
      rawContent.value = ''
  
      // process code blocks after HTML is rendered
      nextTick(() => {
        replaceCodeBlockPlaceholders()
      })
    } catch (error) {
      console.error('Error rendering markdown:', error)
      rawContent.value = markdown
      emit('ready')
    }
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
      processMarkdown(buffer)
    }
  } catch (error) {
    console.error('Error reading stream:', error)
  } finally {
    reader.releaseLock()
    emit('ready')
  }
}

onMounted(() => {
  if (props.textStream) {
    handleStream(props.textStream)
  } else if (props.markdown) {
    processMarkdown(props.markdown)
  }

  watch(() => props.markdown, (newContent) => {
    if (newContent && !props.textStream) {
      processMarkdown(newContent)
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
    const content = pendingContent.value || renderedContent.value || rawContent.value
    if (content) {
      processMarkdown(content)
    }
  })
})

onBeforeUnmount(() => {
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
