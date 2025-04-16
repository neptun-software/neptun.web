<script setup lang="ts">
import Shiki from '@shikijs/markdown-it'
import CodeBlock from './CodeBlock.vue';
import { h, createApp } from 'vue'

const props = defineProps<{
  markdown?: string
  textStream?: ReadableStream<string>
  isStreaming?: boolean // Controls whether to animate the static markdown rendering
}>()

const emit = defineEmits(['ready'])

const renderedContent = ref('')
const codeBlockCounter = ref(0)
const isStreamingActive = ref(false)
const codeBlocksInPreview = ref<Map<string, { 
  blockId: string, 
  placeholder: HTMLElement, 
  content: string, 
  language: string,
  isComplete?: boolean 
}>>(new Map())

// Track completed code blocks to avoid unnecessary re-renders
const completedCodeBlocks = ref<Set<string>>(new Set())
const previewElement = ref<HTMLElement | null>(null)

const { selectedTheme, isDarkMode } = useTheme()

// Pre-parse markdown to identify code blocks
const parseMarkdownForCodeBlocks = (text: string | undefined) => {
  if (!text) return []
  
  const blocks: Array<{ 
    start: number, 
    end: number | null, 
    language: string, 
    id: string,
    content: string
  }> = []
  
  const lines = text.split('\n')
  let inCodeBlock = false
  let currentBlock = { 
    start: -1, 
    end: null as number | null, 
    language: '', 
    id: '',
    content: '' 
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
        content: ''
      }
    } 
    else if (line.startsWith('```') && inCodeBlock) {
      inCodeBlock = false
      currentBlock.end = i
      blocks.push({...currentBlock})
    }
    else if (inCodeBlock) {
      currentBlock.content += line + '\n'
    }
  }
  
  // Handle unfinished code block at end of text
  if (inCodeBlock) {
    blocks.push({...currentBlock})
  }
  
  return blocks
}

// Break markdown into segments (text vs code blocks)
const segmentMarkdown = (mdContent: string | undefined) => {
  if (!mdContent) return []
  
  const segments = []
  const lines = mdContent.split('\n')
  let currentTextSegment = ''
  let inCodeBlock = false
  let currentCodeBlock = {
    language: '',
    content: ''
  }
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    if (line.startsWith('```') && !inCodeBlock) {
      // End text segment if needed
      if (currentTextSegment) {
        segments.push({
          type: 'text',
          content: currentTextSegment
        })
        currentTextSegment = ''
      }
      
      // Start code block
      inCodeBlock = true
      currentCodeBlock = {
        language: line.substring(3).trim() || 'text',
        content: ''
      }
    } 
    else if (line.startsWith('```') && inCodeBlock) {
      // End code block
      segments.push({
        type: 'code',
        language: currentCodeBlock.language,
        content: currentCodeBlock.content
      })
      
      // Reset for next text segment
      inCodeBlock = false
      currentCodeBlock = { language: '', content: '' }
    }
    else if (inCodeBlock) {
      // Add to code block
      currentCodeBlock.content += line + '\n'
    }
    else {
      // Add to text segment
      currentTextSegment += line + '\n'
    }
  }
  
  // Add final text segment if needed
  if (currentTextSegment) {
    segments.push({
      type: 'text',
      content: currentTextSegment
    })
  }
  
  // If we ended with an open code block, add it
  if (inCodeBlock) {
    segments.push({
      type: 'code',
      language: currentCodeBlock.language,
      content: currentCodeBlock.content
    })
  }
  
  return segments
}

const customCodeBlockPlugin = (md: any) => {
  md.renderer.rules.fence = (tokens: any[], idx: number, options: any, env: any, slf: any) => {
    const token = tokens[idx]
    const language = token.info.trim() || 'text'
    
    // Generate unique ID for the code block
    const blockId = env.codeBlocks && env.currentBlockIndex < env.codeBlocks.length 
      ? env.codeBlocks[env.currentBlockIndex++].id
      : `code-block-${codeBlockCounter.value++}`
    
    return `<div data-code-block-id="${blockId}" data-language="${language}"></div>`
  }
}

let md: any = null

onMounted(async () => {
  try {
    md = await import('markdown-it').then(m => {
      const markdownIt = new m.default({
        html: true,
        linkify: true,
        typographer: true
      });
  
      markdownIt.disable(['image']);
      
      return markdownIt;
    });
    
    md.use(customCodeBlockPlugin)
    md.use(await Shiki({
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      }
    }))
    
    // Initial render
    if (props.markdown) {
      renderMarkdown(props.markdown)
    }
    
    // Watch for content changes
    watch(() => props.markdown, (newContent) => {
      if (isStreamingActive.value || !newContent) return
      renderMarkdown(newContent)
    })

    // Watch for streaming trigger
    watch(() => props.isStreaming, (streaming) => {
      if (streaming && props.markdown) {
        // Use timeout to ensure value change is detected even if toggled quickly
        setTimeout(() => {
          streamMarkdownAnimation(props.markdown as string)
        }, 0)
      }
    }, { immediate: true })
    
    // Watch for text stream
    watch(() => props.textStream, (newStream) => {
      if (newStream) {
        // Clear any existing content
        renderedContent.value = ''
        codeBlocksInPreview.value.clear()
        
        // Start reading from the stream
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

// Render markdown directly without streaming
const renderMarkdown = (mdContent: string | undefined) => {
  if (!md || !mdContent) return
  
  // Parse code blocks for custom rendering
  const codeBlocks = parseMarkdownForCodeBlocks(mdContent)
  
  // Setup rendering environment
  const env = { 
    codeBlocks,
    currentBlockIndex: 0
  }
  
  // Reset counter for new rendering
  codeBlockCounter.value = 0
  
  // Render the markdown
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

const markCodeBlockAsComplete = (blockId: string) => {
  completedCodeBlocks.value.add(blockId)
  const block = codeBlocksInPreview.value.get(blockId)
  if (block) {
    block.isComplete = true
    codeBlocksInPreview.value.set(blockId, block)
  }
}

const createCodeBlock = (placeholder: HTMLElement, blockId: string, language: string | undefined, content: string | undefined, stream?: ReadableStream<string>) => {
  const safeLanguage = language || 'text'
  const safeContent = content || ''
  
  const vNode = h(CodeBlock, {
    language: safeLanguage,
    extension: safeLanguage,
    title: `Code Block ${codeBlocksInPreview.value.size + 1}`, // Always use sequential numbering
    content: safeContent,
    theme: selectedTheme.value,
    class: 'prose-code-block',
    textStream: stream,
    blockId,
    onStreamingComplete: (id: string) => {
      markCodeBlockAsComplete(id)
      console.log(`Code block ${id} completed streaming`)
    },
    'onUpdate:isComplete': (isComplete: boolean) => {
      if (isComplete && blockId) {
        markCodeBlockAsComplete(blockId)
        console.log(`Code block ${blockId} marked complete via update event`)
      }
    }
  })
  
  const container = document.createElement('div')
  placeholder.replaceWith(container)
  
  const app = createApp({
    render: () => vNode
  })
  
  app.mount(container)
  
  // Track for later updates
  codeBlocksInPreview.value.set(blockId, {
    blockId,
    placeholder: container,
    content: safeContent,
    language: safeLanguage,
    isComplete: false
  })

  // Capture the mounted element
  const mountedElement = codeBlocksInPreview.value.get(blockId)?.placeholder
  if (mountedElement) {
    // Add a MutationObserver to detect when the code block is actually rendered
    const observer = new MutationObserver((mutations) => {
      // Check if the CodeBlock's inner components are loaded
      const codeComponent = mountedElement.querySelector('.shiki-stream')
      if (codeComponent) {
        // Element is fully rendered, no need to observe anymore
        observer.disconnect()
        
        // Get the Vue component instance to check state - if possible
        const vueElement = mountedElement.querySelector('[data-v-component]')
        if (vueElement) {
          // Using any type to access Vue internal properties safely
          const vueComponent = vueElement as any
          if (vueComponent.__vueParentComponent?.exposed?.isStreamingComplete?.value === true) {
            markCodeBlockAsComplete(blockId)
          }
        }
      }
    })
    
    // Start observing
    observer.observe(mountedElement, { 
      childList: true, 
      subtree: true 
    })
  }
}

// Read from a ReadableStream and render progressively
const readFromStream = async (stream: ReadableStream<string>) => {
  if (!md || isStreamingActive.value) return
  
  isStreamingActive.value = true
  renderedContent.value = ''
  codeBlocksInPreview.value.clear()
  completedCodeBlocks.value.clear()
  
  try {
    const reader = stream.getReader()
    let accumulator = '' // Accumulated content for text
    let codeBlockContents = new Map<string, string>() // Track code block contents separately
    let done = false
    
    // Get fresh reference to container
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
      element: HTMLElement, 
      language: string, 
      index: number,
      contentStream: ReadableStream<string>,
      lastContent: string,
      isComplete: boolean
    }>()
    
    // For stable code block indexing
    let codeBlockCount = 0
    
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
        // Add new content to the accumulator
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
        
        // Now render with stable content
        renderStableStreamContent(
          segments,
          container, 
          renderedSegments, 
          renderedCodeBlocks,
          codeBlockStreams,
          codeBlockContents,
          codeBlockCount,
          completedBlocksSnapshot
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
const renderStableStreamContent = (
  segments: Array<{type: string, content: string, language?: string}>,
  container: HTMLElement, 
  renderedSegments: Map<string, HTMLElement>,
  renderedCodeBlocks: Map<string, { 
    element: HTMLElement, 
    language: string, 
    index: number,
    contentStream: ReadableStream<string>,
    lastContent: string,
    isComplete: boolean
  }>,
  codeBlockStreams: Map<string, TransformStream<string, string>>,
  codeBlockContents: Map<string, string>,
  initialCodeBlockCount: number,
  completedBlocksSnapshot?: Set<string>
) => {
  if (!md) return
  
  // Track the highest index we've seen
  let codeBlockCount = initialCodeBlockCount
  
  // Check existing code blocks for completion first
  renderedCodeBlocks.forEach((blockInfo, blockId) => {
    if (blockInfo.isComplete) {
      completedCodeBlocks.value.add(blockId)
    } else {
      // Try to check the component state directly
      const element = blockInfo.element
      if (element) {
        const shikiElement = element.querySelector('.shiki-stream')
        if (shikiElement && !shikiElement.textContent?.includes('...')) {
          // If content is complete without loading indicators, mark as complete
          markCodeBlockAsComplete(blockId)
        }
      }
    }
  })
  
  // Process each segment in order
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    const segmentId = `segment-${i}`
    
    if (segment.type === 'text') {
      // Handle text segments
      let textContainer = renderedSegments.get(segmentId)
      
      if (!textContainer) {
        // Create new container for this text segment
        textContainer = document.createElement('div')
        textContainer.dataset.segmentId = segmentId
        textContainer.className = 'md-text-segment'
        container.appendChild(textContainer)
        renderedSegments.set(segmentId, textContainer)
      }
      
      // Update text content
      const renderedHtml = md.render(segment.content || '')
      textContainer.innerHTML = renderedHtml
    } 
    else if (segment.type === 'code') {
      // Handle code blocks
      const codeBlockId = `stream-block-${i}`
      
      // Skip if this code block is already complete
      if (completedCodeBlocks.value.has(codeBlockId)) {
        continue
      }
      
      // Get the current content for this block
      const currentContent = codeBlockContents.get(codeBlockId) || ''
      
      // Create code block immediately if it doesn't exist yet
      if (!renderedCodeBlocks.has(codeBlockId)) {
        // Create a new placeholder for the code block
        const placeholder = document.createElement('div')
        placeholder.setAttribute('data-code-block-id', codeBlockId)
        placeholder.setAttribute('data-language', segment.language || 'text')
        container.appendChild(placeholder)
        
        // Create fresh stream for this code block to ensure immediate rendering
        const { readable, writable } = new TransformStream<string, string>()
        codeBlockStreams.set(codeBlockId, { readable, writable })
        
        const contentStream = readable
        
        // Create the code block component even with empty content to make it visible
        createCodeBlock(
          placeholder,
          codeBlockId,
          segment.language,
          '', // Start with empty content
          contentStream 
        )
        
        // Store for future reference with index and last content
        renderedCodeBlocks.set(codeBlockId, {
          element: codeBlocksInPreview.value.get(codeBlockId)?.placeholder as HTMLElement,
          language: segment.language || 'text',
          index: codeBlockCount + 1,
          contentStream,
          lastContent: '',
          isComplete: false
        })
        
        codeBlockCount++
        
        // Immediately send initial content to make it visible
        if (currentContent) {
          const writer = writable.getWriter()
          writer.write(currentContent)
          writer.releaseLock()
        }
      } 
      else {
        // Block exists, check if it was completed during this update cycle
        if (completedBlocksSnapshot && completedBlocksSnapshot.has(codeBlockId)) {
          continue
        }
        
        // Only update existing blocks if they're not complete and content changed
        const blockInfo = renderedCodeBlocks.get(codeBlockId)!
        
        // Apply a more thorough check before updating content
        if (!blockInfo.isComplete && 
            !completedCodeBlocks.value.has(codeBlockId) && 
            currentContent !== blockInfo.lastContent && 
            currentContent.trim().length > 0) {
          
          // Avoid sending content that's a subset of what we've already sent
          if (blockInfo.lastContent && currentContent.startsWith(blockInfo.lastContent)) {
            // Check if there's actual new content beyond what we've sent
            const newContentPart = currentContent.substring(blockInfo.lastContent.length)
            if (!newContentPart.trim()) {
              continue // Skip if there's no actual new content
            }
          }
          
          try {
            // Add a guard in case the writer is in a bad state
            const streamPair = codeBlockStreams.get(codeBlockId)
            if (streamPair) {
              const writer = streamPair.writable.getWriter()
              writer.write(currentContent).catch(err => {
                console.warn(`Error writing to stream for block ${codeBlockId}:`, err)
                // If we encounter an error, mark the block as complete to avoid further attempts
                markCodeBlockAsComplete(codeBlockId)
              })
              writer.releaseLock()
              
              // Update the tracked last content
              blockInfo.lastContent = currentContent
            }
          } catch (error) {
            console.warn(`Failed to update code block ${codeBlockId}:`, error)
            // If we encounter an error, mark the block as complete
            markCodeBlockAsComplete(codeBlockId)
          }
        }
      }
    }
  }
}

// Simulate streaming with animation
const streamMarkdownAnimation = async (mdContent: string) => {
  if (!md || isStreamingActive.value || !mdContent) return
  
  isStreamingActive.value = true
  renderedContent.value = ''
  codeBlocksInPreview.value.clear()
  
  try {
    await nextTick()
    const container = previewElement.value
    if (!container) {
      console.error('Preview container not found')
      isStreamingActive.value = false
      return
    }
    
    container.innerHTML = ''
    
    // Break markdown into segments
    const segments = segmentMarkdown(mdContent)
    const createdContainers = new Map<string, HTMLElement>()
    let codeBlockIndex = 0
    
    // First create all containers to avoid flicker
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]
      const segmentId = `segment-${i}`
      
      if (segment.type === 'text') {
        // Create empty containers for text
        const element = document.createElement('div')
        element.id = segmentId
        container.appendChild(element)
        createdContainers.set(segmentId, element)
      } else if (segment.type === 'code') {
        // Create placeholder for code block
        const blockId = `animation-block-${codeBlockIndex}`
        const placeholder = document.createElement('div')
        placeholder.setAttribute('data-code-block-id', blockId)
        placeholder.setAttribute('data-language', segment.language || 'text')
        container.appendChild(placeholder)
        
        // Create code block with FULL content immediately
        // This fixes the issue with only first line showing
        createCodeBlock(
          placeholder, 
          blockId, 
          segment.language, 
          segment.content // Use full content right away
        )
        
        const codeSegmentId = `code-${blockId}-${i}`
        createdContainers.set(codeSegmentId, placeholder)
        codeBlockIndex++
      }
    }
    
    // Then animate filling in the text content only
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]
      const segmentId = `segment-${i}`
      
      if (segment.type === 'text') {
        const container = createdContainers.get(segmentId)!
        if (!container) continue
        
        // Get rendered HTML
        const renderedText = md.render(segment.content || '')
        const tempElement = document.createElement('div')
        tempElement.innerHTML = renderedText
        
        // Get text content to animate
        const elements = Array.from(tempElement.children)
        
        // Append all elements
        for (const element of elements) {
          container.appendChild(element)
          await new Promise(resolve => setTimeout(resolve, 30))
        }
      }
      // Skip code animation since we're showing full content immediately
    }
    
    emit('ready')
  } catch (error) {
    console.error('Error animating markdown:', error)
  } finally {
    isStreamingActive.value = false
  }
}
</script>

<template>
    <ShadcnScrollArea>
        <div 
            ref="previewElement"
            class="overflow-auto max-w-none h-full prose dark:prose-invert"
            v-html="renderedContent">
        </div>
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

.prose [class*="p-"].shiki-stream {
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
