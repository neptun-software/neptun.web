<script lang="ts" setup>
import type { ThemeOption } from '~/utils/themes'
import { Icon } from '@iconify/vue'
import { CodeToTokenTransformStream } from 'shiki-stream'
import { ShikiStreamRenderer } from 'shiki-stream/vue'
import CopyToClipboard from '~/components/utilities/CopyToClipboard.vue'
import { useShikiHighlighter } from '~/composables/useShikiHighlighter'

const props = defineProps<{
  language: string
  extension: string
  title: string
  content: string
  theme: ThemeOption
  streamingMode?: boolean
  blockId?: string
  textStream?: ReadableStream<string>
}>()

const emit = defineEmits<{
  'streaming-complete': [blockId: string]
  'update:isComplete': [isComplete: boolean]
}>()

const isWrapped = ref(false)
const isExpanded = ref(false)
const { selectedTheme, themeOptions, currentTheme, isDarkMode } = useTheme()
const { getHighlighter, isLoading: isThemeChanging } = useShikiHighlighter()
const isStreamingComplete = ref(false)
const isStreamLocked = ref(false)

// store the final content separately from the stream to allow theme updates
const storedContent = ref(props.content)
const renderedContent = ref('')
const finalRenderStarted = ref(false)

// prevent immediate re-renders on theme changes
const shouldUpdateTheme = ref(false)

defineExpose({
  appendContent,
  refreshStream,
  isStreamingComplete,
})

const theme = computed({
  get: () => selectedTheme.value,
  set: (value) => {
    selectedTheme.value = value
  },
})

const highlighter = ref()
function createTokenStream(content: string): ReadableStream {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(content)
      controller.close()
    },
  }).pipeThrough(
    new CodeToTokenTransformStream({
      highlighter: highlighter.value,
      lang: props.language,
      theme: currentTheme.value,
      allowRecalls: true,
    }),
  )
}

const tokensStream = ref<ReadableStream>()
const isStreaming = ref(false)
const contentBuffer = ref('')

async function applyThemeInstantly() {
  if (isThemeChanging.value) return
  
  try {
    const content = storedContent.value
    if (!content) return
    
    tokensStream.value = createTokenStream(content)
  } catch (error) {
    console.error('Error applying theme instantly:', error)
  }
}

function appendContent(newContent: string) {
  if (!props.streamingMode) return
  
  contentBuffer.value = newContent
  storedContent.value = newContent
  
  if (highlighter.value && !isStreaming.value) {
    refreshStream()
  }
}

function refreshStream() {
  if (!highlighter.value || isStreamingComplete.value) return
  
  const contentToUse = props.streamingMode ? contentBuffer.value : props.content
  if (!contentToUse.trim()) return
  
  resetStream()
  isStreaming.value = true
  
  try {
    const textStream = createContentStream(contentToUse)
    
    tokensStream.value = textStream.pipeThrough(
      new CodeToTokenTransformStream({
        highlighter: highlighter.value,
        lang: props.language,
        theme: currentTheme.value,
        allowRecalls: true,
      }),
    )
  } catch (error) {
    console.error('Error in token transformation:', error)
    isStreaming.value = false
  }
}

onMounted(async () => {
  try {
    highlighter.value = await getHighlighter()
    
    if (props.textStream) {
      startStreamingFromInput(props.textStream)
    } else {
      const initialContent = props.streamingMode ? contentBuffer.value : props.content
      storedContent.value = initialContent
      
      if (props.streamingMode) {
        contentBuffer.value = props.content
      }
      
      if (initialContent) {
        startStreaming()
      }
    }
  } catch (error) {
    console.error('Error initializing highlighter:', error)
  }
})

watch(() => props.content, (newContent) => {
  if (props.streamingMode) return
  
  storedContent.value = newContent
  if (tokensStream.value) {
    resetStream()
  }
  startStreaming()
})

watch([isDarkMode, () => theme.value], () => {
  if (!shouldUpdateTheme.value) {
    nextTick(() => {
      shouldUpdateTheme.value = true
    })
    return
  }

  applyThemeInstantly()
}, { immediate: true })

watch(() => props.textStream, (newStream) => {
  if (newStream && !isStreamingComplete.value) {
    startStreamingFromInput(newStream)
  }
})

watch(isStreaming, (newValue) => {
  if (newValue === false && storedContent.value) {
    isStreamingComplete.value = true
  }
})

async function startStreamingFromInput(stream: ReadableStream<string>) {
  if (!highlighter.value || isStreamingComplete.value) return
  
  isStreaming.value = true
  isStreamingComplete.value = false
  finalRenderStarted.value = false
  
  try {
    const transformStream = new TransformStream<string, string>()
    const writer = transformStream.writable.getWriter()
    
    tokensStream.value = transformStream.readable.pipeThrough(
      new CodeToTokenTransformStream({
        highlighter: highlighter.value,
        lang: props.language,
        theme: currentTheme.value,
        allowRecalls: true,
      }),
    )
    
    const reader = stream.getReader()
    let lastContentLength = 0
    let shortUpdateCount = 0
    let shortUpdateTimer: ReturnType<typeof setTimeout> | null = null
    
    const finalizeStream = async () => {
      if (finalRenderStarted.value) return
      
      finalRenderStarted.value = true
      
      try {
        const finalContent = storedContent.value.trim()
        if (finalContent) {
          writer.write(finalContent)
          renderedContent.value = finalContent
        }
        
        await writer.close()
      } catch (err) {
        console.error('Error finalizing stream:', err)
        try {
          writer.abort(err)
        } catch (abortErr) {
          console.error('Error aborting stream:', abortErr)
        }
      } finally {
        isStreamingComplete.value = true
        isStreamLocked.value = true
        isStreaming.value = false
        
        if (props.blockId) {
          emit('streaming-complete', props.blockId)
          emit('update:isComplete', true)
        }
      }
    }
    
    const writeToStream = (content: string) => {
      if (finalRenderStarted.value) return
      
      try {
        writer.write(content)
        renderedContent.value = content
        storedContent.value = content
        
        shortUpdateCount = 0
      } catch (err) {
        console.error('Error writing to token stream:', err)
        finalizeStream()
      }
    }
    
    while (true) {
      const { value, done } = await reader.read()
      
      if (done) {
        if (shortUpdateTimer) {
          clearTimeout(shortUpdateTimer)
          shortUpdateTimer = null
        }
        
        await finalizeStream()
        break
      }
      
      if (!value || isStreamLocked.value || finalRenderStarted.value) continue
      
      storedContent.value = value
      
      const contentSizeDiff = value.length - lastContentLength
      const hasSignificantNewContent = contentSizeDiff > 10 || lastContentLength === 0
      const isSmallContent = value.length < 100
      
      if (hasSignificantNewContent || isSmallContent) {
        writeToStream(value)
        lastContentLength = value.length
      } else if (contentSizeDiff > 0) {
        shortUpdateCount++
        
        if (shortUpdateCount >= 3) {
          writeToStream(value)
          lastContentLength = value.length
        } else if (!shortUpdateTimer) {
          shortUpdateTimer = setTimeout(() => {
            if (contentSizeDiff > 0) {
              writeToStream(value)
              lastContentLength = value.length
            }
            shortUpdateTimer = null
          }, 25)
        }
      }
    }
    
    reader.releaseLock()
  } catch (error) {
    console.error('Error in streaming:', error)
    isStreaming.value = false
    isStreamingComplete.value = true
    isStreamLocked.value = true
  }
}

function createContentStream(content: string): ReadableStream<string> {
  if (!content || isStreamLocked.value) {
    return new ReadableStream({
      start(controller) {
        controller.close()
      },
    })
  }
  
  return new ReadableStream({
    start(controller) {
      controller.enqueue(content)
      controller.close()
      
      storedContent.value = content
      isStreamLocked.value = true
      isStreamingComplete.value = true
      isStreaming.value = false
      
      if (props.streamingMode && props.blockId) {
        emit('streaming-complete', props.blockId)
        emit('update:isComplete', true)
      }
    },
  })
}

function startStreaming() {
  if (!highlighter.value) return
  isStreamingComplete.value = false
  refreshStream()
}

function resetStream() {
  tokensStream.value = undefined
  isStreaming.value = false
  isStreamingComplete.value = false
  isStreamLocked.value = false
}

function cycleTheme() {
  if (isThemeChanging.value) return
  
  const currentIndex = themeOptions.findIndex(option => option.value === theme.value?.value)
  const nextIndex = (currentIndex + 1) % themeOptions.length
  theme.value = themeOptions[nextIndex]
  
  shouldUpdateTheme.value = true
  applyThemeInstantly()
}

const langColor = computed(() => {
  const langKey = props.extension.toLowerCase() as keyof typeof languageColors
  return languageColors[langKey] || '#ccc'
})
</script>

<template>
  <div class="rounded-lg">
    <br>
    <div v-if="tokensStream" class="relative overflow-clip rounded-lg border">
      <div class="flex sticky top-0 z-10 justify-between items-center px-4 w-full h-12 bg-muted">
        <div class="flex gap-2 items-center">
          <span
            class="inline-block w-2.5 h-2.5 rounded-full"
            :style="{ backgroundColor: langColor }"
          />
          <span class="text-xs font-medium text-muted-foreground">
            {{ title && language ? `${title} |` : title }} {{ language }} {{ extension ? `(${extension})` : "" }}
          </span>
        </div>
        <div class="flex gap-1 items-center">
          <ShadcnTooltipProvider>
            <ShadcnTooltip>
              <ShadcnTooltipTrigger as-child>
                <ShadcnButton
                  variant="ghost"
                  size="icon"
                  class="w-8 h-8"
                  :disabled="isThemeChanging"
                  @click="cycleTheme"
                >
                  <Icon v-if="isThemeChanging" icon="lucide:loader-2" class="w-5 h-5 animate-spin" />
                  <Icon v-else icon="lucide:palette" class="w-5 h-5" />
                </ShadcnButton>
              </ShadcnTooltipTrigger>
              <ShadcnTooltipContent>
                Cycle theme.
              </ShadcnTooltipContent>
            </ShadcnTooltip>

            <ShadcnTooltip>
              <ShadcnTooltipTrigger as-child>
                <ShadcnButton variant="ghost" size="icon" class="w-8 h-8" @click="isWrapped = !isWrapped">
                  <Icon :icon="isWrapped ? 'lucide:wrap-text' : 'lucide:scroll'" class="w-5 h-5" />
                </ShadcnButton>
              </ShadcnTooltipTrigger>
              <ShadcnTooltipContent>
                Toggle Text-wrap.
              </ShadcnTooltipContent>
            </ShadcnTooltip>

            <ShadcnTooltip>
              <ShadcnTooltipTrigger as-child>
                <ShadcnButton variant="ghost" size="icon" class="w-8 h-8" @click="isExpanded = !isExpanded">
                  <Icon :icon="isExpanded ? 'lucide:minimize-2' : 'lucide:maximize-2'" class="w-5 h-5" />
                </ShadcnButton>
              </ShadcnTooltipTrigger>
              <ShadcnTooltipContent>
                Toggle Text-height.
              </ShadcnTooltipContent>
            </ShadcnTooltip>

            <ShadcnTooltip>
              <ShadcnTooltipTrigger as-child>
                <CopyToClipboard :text="content" variant="ghost" class="w-8 h-8" />
              </ShadcnTooltipTrigger>
              <ShadcnTooltipContent>
                Copy Code.
              </ShadcnTooltipContent>
            </ShadcnTooltip>
          </ShadcnTooltipProvider>
        </div>
      </div>

      <ShadcnScrollArea class="p-4">
        <ShikiStreamRenderer
          :stream="tokensStream" class="font-mono text-sm" :class="[
            isWrapped ? 'whitespace-pre-wrap' : 'whitespace-pre',
            isExpanded ? 'max-h-fit' : 'max-h-[25vh]',
          ]"
        />
        <ShadcnScrollBar orientation="vertical" />
        <ShadcnScrollBar orientation="horizontal" :class="{ hidden: isWrapped }" />
      </ShadcnScrollArea>
    </div>
    <br>
  </div>
</template>

<style lang="postcss" scoped>
:deep(.shiki) {
  background: transparent !important;
}

:deep(pre) {
  background: transparent !important;
  margin: 0 !important;
  padding: 0 !important;
}
</style>
