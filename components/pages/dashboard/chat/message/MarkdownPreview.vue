<script setup lang="ts">
import Shiki from '@shikijs/markdown-it'
import CodeBlock from './CodeBlock.vue'
import { h, createApp } from 'vue'

const props = defineProps<{
  markdown?: string
  textStream?: ReadableStream<string>
  isStreaming?: boolean // Controls whether to animate the static markdown rendering
}>()

const renderedContent = ref('')
const codeBlockCounter = ref(0)
const isStreamingActive = ref(false)
const codeBlocksInPreview = ref<Map<string, { blockId: string, placeholder: HTMLElement, content: string, language: string }>>(new Map())
const previewElement = ref<HTMLElement | null>(null)

const { selectedTheme } = useTheme()

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
    md = await import('markdown-it').then(m => new m.default({
      html: true,
      linkify: true,
      typographer: true
    }))
    
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
  })
}

// Create and mount a code block component
const createCodeBlock = (placeholder: HTMLElement, blockId: string, language: string | undefined, content: string | undefined, stream?: ReadableStream<string>) => {
  // Default values for undefined parameters
  const safeLanguage = language || 'text'
  const safeContent = content || ''
  
  // Create component instance
  const vNode = h(CodeBlock, {
    language: safeLanguage,
    extension: safeLanguage,
    title: `Code Block ${codeBlocksInPreview.value.size + 1}`, // Always use sequential numbering
    content: safeContent,
    theme: selectedTheme.value,
    class: 'prose-code-block',
    textStream: stream
  })
  
  // Replace placeholder with component
  const container = document.createElement('div')
  placeholder.replaceWith(container)
  
  // Mount component
  const app = createApp({
    render: () => vNode
  })
  
  app.mount(container)
  
  // Track for later updates
  codeBlocksInPreview.value.set(blockId, {
    blockId,
    placeholder: container,
    content: safeContent,
    language: safeLanguage
  })
}

// Read from a ReadableStream and render progressively
const readFromStream = async (stream: ReadableStream<string>) => {
  if (!md || isStreamingActive.value) return
  
  isStreamingActive.value = true
  renderedContent.value = ''
  codeBlocksInPreview.value.clear()
  
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
      lastContent: string
    }>()
    
    // For stable code block indexing
    let codeBlockCount = 0
    
    while (!done) {
      const { value, done: isDone } = await reader.read()
      done = isDone
      
      if (value) {
        // Add new content to the accumulator
        accumulator += value
        
        // Pre-process the entire content to separate text and code blocks
        const segments = segmentMarkdown(accumulator)
        
        // Process code blocks first to extract and track their content
        for (let i = 0; i < segments.length; i++) {
          const segment = segments[i]
          if (segment.type === 'code') {
            const codeBlockId = `stream-block-${i}`
            codeBlockContents.set(codeBlockId, segment.content || '')
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
          codeBlockCount
        )
      }
      
      // Small delay to allow UI to update
      if (!done) {
        await new Promise(resolve => setTimeout(resolve, 10))
      }
    }
    
    reader.releaseLock()
  } catch (error) {
    console.error('Error reading from stream:', error)
  } finally {
    isStreamingActive.value = false
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
    lastContent: string
  }>,
  codeBlockStreams: Map<string, TransformStream<string, string>>,
  codeBlockContents: Map<string, string>,
  codeBlockCount: number
) => {
  if (!md) return
  
  // Track the highest index we've seen
  let highestCodeBlockIndex = codeBlockCount
  
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
      // Handle code blocks - these need special treatment to avoid flickering
      const codeBlockId = `stream-block-${i}`
      const currentContent = codeBlockContents.get(codeBlockId) || ''
      
      // Check if we already have this code block
      if (!renderedCodeBlocks.has(codeBlockId)) {
        // Create a new placeholder for the code block
        const placeholder = document.createElement('div')
        placeholder.setAttribute('data-code-block-id', codeBlockId)
        placeholder.setAttribute('data-language', segment.language || 'text')
        container.appendChild(placeholder)
        
        // Create a stable transform stream for this code block
        if (!codeBlockStreams.has(codeBlockId)) {
          const { readable, writable } = new TransformStream<string, string>()
          codeBlockStreams.set(codeBlockId, { readable, writable })
        }
        
        const streamPair = codeBlockStreams.get(codeBlockId)!
        const contentStream = streamPair.readable
        
        // Create initial code block with content and stream
        createCodeBlock(
          placeholder,
          codeBlockId,
          segment.language,
          currentContent,
          contentStream
        )
        
        // Store for future reference with index and last content
        renderedCodeBlocks.set(codeBlockId, {
          element: codeBlocksInPreview.value.get(codeBlockId)?.placeholder as HTMLElement,
          language: segment.language || 'text',
          index: highestCodeBlockIndex + 1,
          contentStream,
          lastContent: currentContent
        })
        
        highestCodeBlockIndex++
      } 
      
      // Only send updates if content has changed
      const blockInfo = renderedCodeBlocks.get(codeBlockId)!
      if (currentContent !== blockInfo.lastContent) {
        // Send the latest content to the stream
        const streamPair = codeBlockStreams.get(codeBlockId)
        if (streamPair) {
          const writer = streamPair.writable.getWriter()
          writer.write(currentContent)
          writer.releaseLock()
          
          // Update the tracked last content
          blockInfo.lastContent = currentContent
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
  } catch (error) {
    console.error('Error animating markdown:', error)
  } finally {
    isStreamingActive.value = false
  }
}
</script>

<template>
    <ShadcnScrollArea class="h-full">
        <div 
            ref="previewElement"
            class="overflow-auto max-w-none h-full prose dark:prose-invert"
            v-html="renderedContent">
        </div>
    </ShadcnScrollArea>
</template>

<style>
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
</style>
