<script setup lang="ts">
import Shiki from '@shikijs/markdown-it'
import { createApp, h } from 'vue'
import CodeBlock from './CodeBlock.vue'

const props = defineProps<{
  markdown?: string
  textStream?: ReadableStream<string>
  isStreaming?: boolean
}>()

const emit = defineEmits(['ready'])

const renderedContent = ref('')
const codeBlockCounter = ref(0)
const isStreamingActive = ref(false)
const codeBlocksInPreview = ref<Map<string, {
  blockId: string
  placeholder: HTMLElement
  content: string
  language: string
  isComplete?: boolean
}>>(new Map())

// Track completed code blocks to avoid unnecessary re-renders
const completedCodeBlocks = ref<Set<string>>(new Set())
const previewElement = ref<HTMLElement | null>(null)

const { selectedTheme, isDarkMode } = useTheme()

// Pre-parse markdown to identify code blocks
function parseMarkdownForCodeBlocks(text: string | undefined) {
  if (!text) {
    return []
  }

  const blocks: Array<{
    start: number
    end: number | null
    language: string
    id: string
    content: string
  }> = []

  const lines = text.split('\n')
  let inCodeBlock = false
  let currentBlock = {
    start: -1,
    end: null as number | null,
    language: '',
    id: '',
    content: '',
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.startsWith('```') && !inCodeBlock) {
      inCodeBlock = true
      currentBlock = {
        start: i,
        end: null,
        language: line.substring(3).trim() || 'text',
        id: `code-block-${blocks.length}`,
        content: '',
      }
    } else if (line.startsWith('```') && inCodeBlock) {
      inCodeBlock = false
      currentBlock.end = i
      blocks.push({ ...currentBlock })
    } else if (inCodeBlock) {
      currentBlock.content += `${line}\n`
    }
  }

  // Handle unfinished code block at end of text
  if (inCodeBlock) {
    blocks.push({ ...currentBlock })
  }

  return blocks
}

// Break markdown into segments (text vs code blocks)
function segmentMarkdown(mdContent: string | undefined) {
  if (!mdContent) {
    return []
  }

  const segments = []
  const lines = mdContent.split('\n')
  let currentTextSegment = ''
  let inCodeBlock = false
  let currentCodeBlock = {
    language: '',
    content: '',
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.startsWith('```') && !inCodeBlock) {
      if (currentTextSegment) {
        segments.push({
          type: 'text',
          content: currentTextSegment,
        })
        currentTextSegment = ''
      }

      inCodeBlock = true
      currentCodeBlock = {
        language: line.substring(3).trim() || 'text',
        content: '',
      }
    } else if (line.startsWith('```') && inCodeBlock) {
      segments.push({
        type: 'code',
        language: currentCodeBlock.language,
        content: currentCodeBlock.content,
      })

      inCodeBlock = false
      currentCodeBlock = { language: '', content: '' }
    } else if (inCodeBlock) {
      currentCodeBlock.content += `${line}\n`
    } else {
      currentTextSegment += `${line}\n`
    }
  }

  if (currentTextSegment) {
    segments.push({
      type: 'text',
      content: currentTextSegment,
    })
  }

  if (inCodeBlock) {
    segments.push({
      type: 'code',
      language: currentCodeBlock.language,
      content: currentCodeBlock.content,
    })
  }

  return segments
}

function customCodeBlockPlugin(md: any) {
  md.renderer.rules.fence = (tokens: any[], idx: number, options: any, env: any, slf: any) => {
    const token = tokens[idx]
    const language = token.info.trim() || 'text'

    const blockId = env.codeBlocks && env.currentBlockIndex < env.codeBlocks.length
      ? env.codeBlocks[env.currentBlockIndex++].id
      : `code-block-${codeBlockCounter.value++}`

    return `<div data-code-block-id="${blockId}" data-language="${language}"></div>`
  }
}

let md: any = null

onMounted(async () => {
  try {
    md = await import('markdown-it').then((m) => {
      const markdownIt = new m.default({
        html: true,
        linkify: true,
        typographer: true,
      })

      markdownIt.disable(['image'])

      return markdownIt
    })

    md.use(customCodeBlockPlugin)
    md.use(await Shiki({
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    }))

    if (props.markdown) {
      renderMarkdown(props.markdown)
    }

    watch(() => props.markdown, (newContent) => {
      if (!newContent) {
        return
      }

      if (props.isStreaming) {
        streamMarkdownAnimation(newContent)
      } else if (!isStreamingActive.value) {
        renderMarkdown(newContent)
      }
    })

    watch(() => props.isStreaming, (streaming) => {
      if (streaming && props.markdown) {
        streamMarkdownAnimation(props.markdown)
      }
    }, { immediate: true })

    watch(() => props.textStream, (newStream) => {
      if (newStream) {
        renderedContent.value = ''
        codeBlocksInPreview.value.clear()

        readFromStream(newStream)
      }
    }, { immediate: true })

    watch(() => isDarkMode.value, () => {
      // Theme changed, but we don't need to re-render content
      // The code blocks will keep their current theme until they're interacted with or new ones are created
      // This watcher is needed!!!
    }, { immediate: true })
  } catch (error) {
    console.error('Error initializing markdown:', error)
  }
})

function renderMarkdown(mdContent: string | undefined) {
  if (!md || !mdContent) {
    return
  }

  const codeBlocks = parseMarkdownForCodeBlocks(mdContent)
  const env = {
    codeBlocks,
    currentBlockIndex: 0,
  }

  codeBlockCounter.value = 0
  renderedContent.value = md.render(mdContent, env)

  // Handle code blocks after DOM is updated
  nextTick(() => {
    const placeholders = document.querySelectorAll('[data-code-block-id]')
    codeBlocksInPreview.value.clear()

    placeholders.forEach((placeholder, index) => {
      const blockId = placeholder.getAttribute('data-code-block-id')
      const language = placeholder.getAttribute('data-language') || 'text'

      if (blockId && index < codeBlocks.length) {
        createCodeBlock(placeholder as HTMLElement, blockId, language, codeBlocks[index].content)
      }
    })

    nextTick(() => {
      emit('ready')
    })
  })
}

function markCodeBlockAsComplete(blockId: string) {
  completedCodeBlocks.value.add(blockId)
  const block = codeBlocksInPreview.value.get(blockId)
  if (block) {
    block.isComplete = true
    codeBlocksInPreview.value.set(blockId, block)
  }
}

function createCodeBlock(placeholder: HTMLElement, blockId: string, language: string | undefined, content: string | undefined, stream?: ReadableStream<string>) {
  const safeLanguage = language || 'text'
  const safeContent = content || ''

  // Store in our tracking map first so we can reference it later
  codeBlocksInPreview.value.set(blockId, {
    blockId,
    placeholder,
    content: safeContent,
    language: safeLanguage,
    isComplete: false,
  })

  const vNode = h(CodeBlock, {
    'language': safeLanguage,
    'extension': safeLanguage,
    'title': `Code Block ${codeBlocksInPreview.value.size}`,
    'content': safeContent,
    'theme': selectedTheme.value,
    'class': 'prose-code-block',
    'textStream': stream,
    blockId,
    'streamingMode': !!stream,
    'onStreamingComplete': (id: string) => {
      markCodeBlockAsComplete(id)
      console.log(`Code block ${id} completed streaming`)
    },
    'onUpdate:isComplete': (isComplete: boolean) => {
      if (isComplete && blockId) {
        markCodeBlockAsComplete(blockId)
        console.log(`Code block ${blockId} marked complete via update event`)
      }
    },
  })

  const container = document.createElement('div')
  placeholder.replaceWith(container)

  const app = createApp({
    render: () => vNode,
  })

  app.mount(container)

  // Update our reference with the mounted container
  const existingData = codeBlocksInPreview.value.get(blockId)
  if (existingData) {
    existingData.placeholder = container
    codeBlocksInPreview.value.set(blockId, existingData)
  }

  // Add observer to detect when content is fully rendered
  addCodeBlockObserver(blockId, container)

  return container
}

function addCodeBlockObserver(blockId: string, container: HTMLElement) {
  // Capture the mounted element
  if (container) {
    // Add a MutationObserver to detect when the code block is actually rendered
    const observer = new MutationObserver((mutations) => {
      // Check if the CodeBlock's inner components are loaded
      const codeComponent = container.querySelector('.shiki-stream')
      if (codeComponent) {
        // Element is fully rendered, no need to observe anymore
        observer.disconnect()

        // Get the Vue component instance to check state - if possible
        const vueElement = container.querySelector('[data-v-component]')
        if (vueElement) {
          const vueComponent = vueElement as any
          if (vueComponent.__vueParentComponent?.exposed?.isStreamingComplete?.value === true) {
            markCodeBlockAsComplete(blockId)
          }
        }
      }
    })

    observer.observe(container, {
      childList: true,
      subtree: true,
    })
  }
}

async function readFromStream(stream: ReadableStream<string>) {
  if (!md || isStreamingActive.value) {
    return
  }

  isStreamingActive.value = true
  renderedContent.value = ''
  codeBlocksInPreview.value.clear()
  completedCodeBlocks.value.clear()

  try {
    const reader = stream.getReader()
    let accumulator = ''
    const codeBlockContents = new Map<string, string>()
    let done = false

    await nextTick()
    const container = previewElement.value
    if (!container) {
      console.error('Preview container not found')
      reader.releaseLock()
      isStreamingActive.value = false
      return
    }

    container.innerHTML = ''

    // Store streams for code blocks to avoid recreation
    const codeBlockStreams = new Map<string, TransformStream<string, string>>()

    // For tracking rendered content
    const renderedSegments = new Map<string, HTMLElement>()
    const renderedCodeBlocks = new Map<string, {
      element: HTMLElement
      language: string
      index: number
      contentStream: ReadableStream<string>
      lastContent: string
      isComplete: boolean
    }>()

    // For stable code block indexing
    const codeBlockCount = 0

    // Use smarter chunk handling - process immediately for first chunks or when needed
    let processingChunk = false
    let queuedChunk: string | null = null
    let lastProcessedLength = 0
    let consecutiveSmallUpdates = 0

    const processChunk = async (value: string) => {
      if (processingChunk) {
        // If already processing, queue the newest one
        queuedChunk = value
        return
      }

      processingChunk = true

      try {
        accumulator = value

        // Pre-process the entire content to separate text and code blocks
        const segments = segmentMarkdown(accumulator)

        // Create a snapshot of the current completed blocks to check later
        const completedBlocksSnapshot = new Set(completedCodeBlocks.value)

        // Process code blocks first to extract and track their content
        for (let i = 0; i < segments.length; i++) {
          const segment = segments[i]
          if (segment.type === 'code') {
            const codeBlockId = `stream-block-${i}`

            // Skip updating content for completed blocks
            if (completedCodeBlocks.value.has(codeBlockId)) {
              continue
            }

            // Check if this is a new code block
            const isNewCodeBlock = !codeBlockContents.has(codeBlockId)

            // Check if content changed (for existing blocks)
            const existingContent = codeBlockContents.get(codeBlockId) || ''
            const contentChanged = existingContent !== segment.content && segment.content !== ''

            // For small code blocks or significant changes, always update
            const isSmallCodeBlock = segment.content.length < 100
            const hasSignificantChange = segment.content.length > existingContent.length + 5

            // Always update new blocks or changed content that meets our criteria
            if (isNewCodeBlock || (contentChanged && (isSmallCodeBlock || hasSignificantChange))) {
              codeBlockContents.set(codeBlockId, segment.content || '')
            }
          }
        }

        renderStableStreamContent(
          segments,
          container,
          renderedSegments,
          renderedCodeBlocks,
          codeBlockStreams,
          codeBlockContents,
          codeBlockCount,
          completedBlocksSnapshot,
        )

        lastProcessedLength = value.length

        // Allow immediate processing of queued chunks after this
        await nextTick()
      } finally {
        processingChunk = false

        // If we have a queued chunk, process it next
        if (queuedChunk) {
          const nextChunk = queuedChunk
          queuedChunk = null
          await processChunk(nextChunk)
        }
      }
    }

    // Process the first chunk immediately to make code blocks appear immediately
    const firstChunk = await reader.read()
    if (!firstChunk.done && firstChunk.value) {
      await processChunk(firstChunk.value)

      emit('ready')
    }

    // Continue processing remaining chunks
    while (!done) {
      const { value, done: isDone } = await reader.read()
      done = isDone

      if (value) {
        // Determine if we should process this update immediately
        const sizeDiff = value.length - lastProcessedLength

        // Always process if it's a significant update
        if (sizeDiff > 20) {
          consecutiveSmallUpdates = 0
          await processChunk(value)
        }
        // For small updates, we'll count them and only process if we get a few
        else if (sizeDiff > 0) {
          consecutiveSmallUpdates++

          // Process every few small updates
          if (consecutiveSmallUpdates >= 3) {
            consecutiveSmallUpdates = 0
            await processChunk(value)
          } else {
            // Just queue it for now
            queuedChunk = value
          }
        }
      }
    }

    // Process any final queued chunk
    if (queuedChunk) {
      await processChunk(queuedChunk)
    }

    reader.releaseLock()
  } catch (error) {
    console.error('Error reading from stream:', error)
  } finally {
    isStreamingActive.value = false

    emit('ready')
  }
}

// Render stream content with stable code blocks to avoid flickering
function renderStableStreamContent(segments: Array<{ type: string, content: string, language?: string }>,
  container: HTMLElement,
  renderedSegments: Map<string, HTMLElement>,
  renderedCodeBlocks: Map<string, {
    element: HTMLElement
    language: string
    index: number
    contentStream: ReadableStream<string>
    lastContent: string
    isComplete: boolean
  }>,
  codeBlockStreams: Map<string, TransformStream<string, string>>,
  codeBlockContents: Map<string, string>,
  initialCodeBlockCount: number,
  completedBlocksSnapshot?: Set<string>) {
  if (!md) {
    return
  }

  let codeBlockCount = initialCodeBlockCount
  renderedCodeBlocks.forEach((blockInfo, blockId) => {
    if (blockInfo.isComplete) {
      completedCodeBlocks.value.add(blockId)
    } else {
      const element = blockInfo.element
      if (element) {
        const shikiElement = element.querySelector('.shiki-stream')
        if (shikiElement) {
          markCodeBlockAsComplete(blockId)
        }
      }
    }
  })

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    const segmentId = `segment-${i}`

    if (segment.type === 'text') {
      let textContainer = renderedSegments.get(segmentId)

      if (!textContainer) {
        textContainer = document.createElement('div')
        textContainer.dataset.segmentId = segmentId
        textContainer.className = 'md-text-segment'
        container.appendChild(textContainer)
        renderedSegments.set(segmentId, textContainer)
      }

      const renderedHtml = md.render(segment.content || '')
      textContainer.innerHTML = renderedHtml
    } else if (segment.type === 'code') {
      const codeBlockId = `stream-block-${i}`

      if (completedCodeBlocks.value.has(codeBlockId)) {
        continue
      }

      const currentContent = codeBlockContents.get(codeBlockId) || ''

      // console.log(`Block ${codeBlockId} - Current content length: ${currentContent.length}`)

      if (!renderedCodeBlocks.has(codeBlockId)) {
        const placeholder = document.createElement('div')
        placeholder.setAttribute('data-code-block-id', codeBlockId)
        placeholder.setAttribute('data-language', segment.language || 'text')
        container.appendChild(placeholder)

        const { readable, writable } = new TransformStream<string, string>()
        codeBlockStreams.set(codeBlockId, { readable, writable })

        const contentStream = readable

        codeBlockContents.set(codeBlockId, currentContent)
        const elementContainer = createCodeBlock(
          placeholder,
          codeBlockId,
          segment.language,
          currentContent,
          contentStream,
        )

        renderedCodeBlocks.set(codeBlockId, {
          element: elementContainer,
          language: segment.language || 'text',
          index: codeBlockCount + 1,
          contentStream,
          lastContent: currentContent,
          isComplete: false,
        })

        codeBlockCount++

        // Send initial content through the stream
        if (currentContent) {
          try {
            const writer = writable.getWriter()
            writer.write(currentContent)
            writer.releaseLock()
          } catch (error) {
            console.warn(`Failed to write initial content for block ${codeBlockId}:`, error)
          }
        }
      } else {
        if (completedBlocksSnapshot && completedBlocksSnapshot.has(codeBlockId)) {
          continue
        }

        // Only update existing blocks if they're not complete and content changed
        const blockInfo = renderedCodeBlocks.get(codeBlockId)!

        if (!blockInfo.isComplete
          && !completedCodeBlocks.value.has(codeBlockId)
          && currentContent !== blockInfo.lastContent
          && currentContent.trim().length > 0) {
          // Skip if there's no actual new content
          if (blockInfo.lastContent && currentContent.startsWith(blockInfo.lastContent)) {
            const newContentPart = currentContent.substring(blockInfo.lastContent.length)
            if (!newContentPart.trim()) {
              continue
            }
          }

          try {
            // Update our tracking map
            const existingBlockData = codeBlocksInPreview.value.get(codeBlockId)
            if (existingBlockData) {
              existingBlockData.content = currentContent
              codeBlocksInPreview.value.set(codeBlockId, existingBlockData)
            }

            // Then update the stream
            const streamPair = codeBlockStreams.get(codeBlockId)
            if (streamPair) {
              const writer = streamPair.writable.getWriter()
              writer.write(currentContent).catch((err) => {
                console.warn(`Error writing to stream for block ${codeBlockId}:`, err)
                markCodeBlockAsComplete(codeBlockId)
              })
              writer.releaseLock()

              // Update the tracked last content
              blockInfo.lastContent = currentContent

              // Find any component instances and update them directly too
              const codeBlockElement = blockInfo.element
              if (codeBlockElement) {
                // Try to access Exposed API
                const vueInstance = (codeBlockElement as any).__vue_app__?.component?.exposed
                if (vueInstance && typeof vueInstance.appendContent === 'function') {
                  vueInstance.appendContent(currentContent)
                }

                // Fallback method to update the rendered content through our map
                const codeBlockData = codeBlocksInPreview.value.get(codeBlockId)
                if (codeBlockData) {
                  codeBlockData.content = currentContent
                  codeBlocksInPreview.value.set(codeBlockId, codeBlockData)
                }
              }
            }
          } catch (error) {
            console.warn(`Failed to update code block ${codeBlockId}:`, error)
            markCodeBlockAsComplete(codeBlockId)
          }
        }
      }
    }
  }
}

async function streamMarkdownAnimation(mdContent: string) {
  if (!md || isStreamingActive.value || !mdContent) {
    return
  }

  try {
    const textStream = new ReadableStream<string>({
      start(controller) {
        controller.enqueue(mdContent)
        controller.close()
      },
    })

    readFromStream(textStream)
  } catch (error) {
    console.error('Error creating streaming animation:', error)
    isStreamingActive.value = false
  }
}
</script>

<template>
  <ShadcnScrollArea>
    <div
      ref="previewElement"
      class="overflow-auto max-w-none h-full prose dark:prose-invert"
      v-html="renderedContent"
    />
  </ShadcnScrollArea>
</template>

<style lang="postcss">
.prose pre,
.prose pre.shiki,
.prose pre.shiki-stream,
.prose pre code {
  background-color: transparent !important;
  margin: 0 !important;
  padding: 0 !important;
  border-radius: 0 !important;
  font-size: inherit !important;
  font-weight: inherit !important;
  border: none !important;
  overflow: visible !important;
}

.prose pre {
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  border-radius: 0 !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  padding-inline-end: 0 !important;
  padding-inline-start: 0 !important;
  font-size: inherit !important;
  color: inherit !important;
  overflow-x: visible !important;
  font-weight: inherit !important;
}

.prose pre code {
  color: inherit !important;
  background-color: transparent !important;
  padding: 0 !important;
  font-weight: inherit !important;
  font-size: inherit !important;
}

.prose [class*='p-'].shiki-stream {
  padding: 1rem !important;
}

:deep(details) {
  @apply bg-secondary rounded-md p-2;
}

:deep(summary) {
  @apply cursor-pointer;
  -webkit-user-select: none; /* Safari */
  -ms-user-select: none; /* IE 10 and IE 11 */
  user-select: none;
}

:deep(details + *) {
  @apply mt-4;
}
</style>
