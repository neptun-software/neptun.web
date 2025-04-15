<script lang="ts" setup>
import { ShikiStreamRenderer } from 'shiki-stream/vue'
import { CodeToTokenTransformStream } from 'shiki-stream'
import CopyToClipboard from '~/components/utilities/CopyToClipboard.vue'
import { Icon } from '@iconify/vue'

const isWrapped = ref(false)
const isExpanded = ref(false)
const { isDarkMode, selectedTheme, themeOptions, currentTheme } = useTheme()
const { getHighlighter } = useShikiHighlighter()

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
}>()

defineExpose({
  appendContent,
  refreshStream
})

const tokensStream = ref<ReadableStream>()
const isStreaming = ref(false)
const highlighter = ref()
const fullContent = ref('')
const contentBuffer = ref('')

function appendContent(newContent: string) {
  if (!props.streamingMode) return

  contentBuffer.value = newContent
  if (highlighter.value && !isStreaming.value) {
    refreshStream()
  }
}

function refreshStream() {
  if (!highlighter.value) return

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
        allowRecalls: true
      })
    )
  } catch (error) {
    console.error('Error in token transformation:', error)
    isStreaming.value = false
  }
}

const theme = computed({
  get: () => selectedTheme.value,
  set: (value) => {
    selectedTheme.value = value
  }
})

onMounted(async () => {
  try {
    highlighter.value = await getHighlighter()

    if (props.textStream) {
      startStreamingFromInput(props.textStream)
    } else {
      const initialContent = props.streamingMode ? contentBuffer.value : props.content
      if (props.streamingMode) {
        contentBuffer.value = props.content
      }

      if (initialContent) {
        fullContent.value = initialContent
        startStreaming()
      }
    }
  } catch (error) {
    console.error('Error initializing highlighter:', error)
  }
})

watch(() => props.content, (newContent) => {
  if (props.streamingMode) return

  if (tokensStream.value) {
    resetStream()
  }
  fullContent.value = newContent
  startStreaming()
})

watch([() => isDarkMode.value, () => selectedTheme.value], () => {
  if (highlighter.value && fullContent.value) {
    applyThemeInstantly()
  }
}, { deep: true })

watch(() => props.textStream, (newStream) => {
  if (newStream) {
    startStreamingFromInput(newStream)
  }
})

const applyThemeInstantly = () => {
  try {
    const textStream = new ReadableStream({
      start(controller) {
        controller.enqueue(fullContent.value)
        controller.close()
      }
    })

    tokensStream.value = textStream.pipeThrough(
      new CodeToTokenTransformStream({
        highlighter: highlighter.value,
        lang: props.language,
        theme: currentTheme.value,
        allowRecalls: true
      })
    )
  } catch (error) {
    console.error('Error applying theme instantly:', error)
  }
}

const createContentStream = (content: string): ReadableStream<string> => {
  if (!content) {
    return new ReadableStream({
      start(controller) {
        controller.close()
      }
    })
  }

  fullContent.value = content

  const fileSize = content.length
  const chunkSize = fileSize > 100000 ? 10000 : 5000
  const streamDelay = fileSize > 50000 ? 5 : 15

  if (fileSize < 10000) {
    const lines = content.split('\n')

    return new ReadableStream({
      start(controller) {
        let lineIndex = 0
        let currentLine = ''

        const interval = setInterval(() => {
          if (lineIndex < lines.length) {
            currentLine = lines[lineIndex] + '\n'
            controller.enqueue(currentLine)
            lineIndex++
          } else {
            clearInterval(interval)
            controller.close()
            isStreaming.value = false
            if (props.streamingMode && props.blockId) {
              emit('streaming-complete', props.blockId)
            }
          }
        }, 30)
      }
    })
  } else {
    return new ReadableStream({
      start(controller) {
        if (fileSize > 500000) {
          controller.enqueue(content)
          controller.close()
          isStreaming.value = false
          if (props.streamingMode && props.blockId) {
            emit('streaming-complete', props.blockId)
          }
          return
        }

        let position = 0

        const processNextChunk = () => {
          if (position < fileSize) {
            const end = Math.min(position + chunkSize, fileSize)
            controller.enqueue(content.substring(position, end))
            position = end

            setTimeout(processNextChunk, streamDelay)
          } else {
            controller.close()
            isStreaming.value = false
            if (props.streamingMode && props.blockId) {
              emit('streaming-complete', props.blockId)
            }
          }
        }

        processNextChunk()
      }
    })
  }
}

const startStreaming = () => {
  if (!highlighter.value || isStreaming.value) return

  refreshStream()
}

const resetStream = () => {
  tokensStream.value = undefined
  isStreaming.value = false
}

const cycleTheme = () => {
  const currentIndex = themeOptions.findIndex(option => option.value === theme.value?.value)
  const nextIndex = (currentIndex + 1) % themeOptions.length
  theme.value = themeOptions[nextIndex]
}

const langColor = computed(() => {
  const langKey = props.language.toLowerCase() as keyof typeof languageColors
  return languageColors[langKey] || '#ccc'
})

const startStreamingFromInput = async (stream: ReadableStream<string>) => {
  if (!highlighter.value) return
  
  isStreaming.value = true
  
  try {
    const reader = stream.getReader()
    
    // Create a single token stream that will be updated
    tokensStream.value = new ReadableStream({
      start(controller) {
        // Initial empty enqueue
        controller.enqueue('')
      }
    }).pipeThrough(
      new CodeToTokenTransformStream({
        highlighter: highlighter.value,
        lang: props.language,
        theme: currentTheme.value,
        allowRecalls: true
      })
    )
    
    // Process the incoming stream
    while (true) {
      const { done, value } = await reader.read()
      
      if (done) {
        isStreaming.value = false
        if (props.blockId) {
          emit('streaming-complete', props.blockId)
        }
        break
      }
      
      // Use the full value directly - this is the complete code block content
      fullContent.value = value
      
      // We'll update the existing stream rather than creating a new one
      // This helps prevent flickering
      resetStream()
      
      tokensStream.value = new ReadableStream({
        start(controller) {
          controller.enqueue(fullContent.value)
          controller.close()
        }
      }).pipeThrough(
        new CodeToTokenTransformStream({
          highlighter: highlighter.value,
          lang: props.language,
          theme: currentTheme.value,
          allowRecalls: true
        })
      )
      
      // Small delay to allow UI to update
      await new Promise(resolve => setTimeout(resolve, 50))
    }
  } catch (error) {
    console.error('Error in streaming:', error)
    isStreaming.value = false
  }
}
</script>

<template>
  <div class="rounded-lg"><br>
    <div v-if="tokensStream" class="relative overflow-clip rounded-lg border">
      <div class="flex sticky top-0 z-10 justify-between items-center px-4 w-full h-12 bg-muted">
        <div class="flex gap-2 items-center">
          <span
            class="inline-block w-2.5 h-2.5 rounded-full"
            :style="{ backgroundColor: langColor }"
          ></span>
          <span class="text-xs font-medium text-muted-foreground">
            {{ title && language ? `${title} |` : title }} {{ language }} {{ extension ? `(${extension})` : "" }}
          </span>
        </div>
        <div class="flex gap-1 items-center">
          <ShadcnTooltipProvider>
            <ShadcnTooltip>
              <ShadcnTooltipTrigger asChild>
                <ShadcnButton variant="ghost" size="icon" class="w-8 h-8" @click="cycleTheme">
                  <Icon icon="lucide:palette" class="w-5 h-5" />
                </ShadcnButton>
              </ShadcnTooltipTrigger>
              <ShadcnTooltipContent>
                Cycle theme.
              </ShadcnTooltipContent>
            </ShadcnTooltip>

            <ShadcnTooltip>
              <ShadcnTooltipTrigger asChild>
                <ShadcnButton variant="ghost" size="icon" class="w-8 h-8" @click="isWrapped = !isWrapped">
                  <Icon :icon="isWrapped ? 'lucide:wrap-text' : 'lucide:scroll'" class="w-5 h-5" />
                </ShadcnButton>
              </ShadcnTooltipTrigger>
              <ShadcnTooltipContent>
                Toggle Text-wrap.
              </ShadcnTooltipContent>
            </ShadcnTooltip>

            <ShadcnTooltip>
              <ShadcnTooltipTrigger asChild>
                <ShadcnButton variant="ghost" size="icon" class="w-8 h-8" @click="isExpanded = !isExpanded">
                  <Icon :icon="isExpanded ? 'lucide:minimize-2' : 'lucide:maximize-2'" class="w-5 h-5" />
                </ShadcnButton>
              </ShadcnTooltipTrigger>
              <ShadcnTooltipContent>
                Toggle Text-height.
              </ShadcnTooltipContent>
            </ShadcnTooltip>

            <ShadcnTooltip>
              <ShadcnTooltipTrigger asChild>
                <CopyToClipboard :text="content" variant="ghost" class="w-8 h-8" />
              </ShadcnTooltipTrigger>
              <ShadcnTooltipContent>
                Copy Code.
              </ShadcnTooltipContent>
            </ShadcnTooltip>
          </ShadcnTooltipProvider>
        </div>
      </div>

      <ShadcnScrollArea>
        <ShikiStreamRenderer :stream="tokensStream" class="p-4 font-mono text-sm" :class="[
          isWrapped ? 'whitespace-pre-wrap' : 'whitespace-pre',
          isExpanded ? 'max-h-fit' : 'max-h-[25vh]'
        ]" />
        <ShadcnScrollBar orientation="vertical" />
        <ShadcnScrollBar orientation="horizontal" :class="{ 'hidden': isWrapped }" />
      </ShadcnScrollArea>
    </div><br>
  </div>
</template>
