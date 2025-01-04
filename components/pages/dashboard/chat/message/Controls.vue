<script lang="ts" setup>
import { useThrottleFn } from '@vueuse/core'
import { CirclePause, Volume2 } from 'lucide-vue-next'

const props = defineProps<{
  message: string
}>()

const messageAsPlainText = ref(props.message)
const isProcessing = ref(false)

const updateMessageText = useThrottleFn(async (text: string) => {
  if (isProcessing.value) {
    return
  }

  isProcessing.value = true

  try {
    messageAsPlainText.value = await stripMarkdown(text)
  } finally {
    isProcessing.value = false
  }
}, 300)

watch(() => props.message, (newMessage) => {
  updateMessageText(newMessage)
})

onMounted(() => {
  updateMessageText(props.message)
})

/* SPEECH SYNTHESIS */
const {
  isSupported: isSpeechSynthesisSupported,
  isPlaying: isSpeaking,
  status: speechSynthesisStatus,
  utterance: currentUtterance,
  stop: stopSpeaking,
  speak: speakText,
  error: speechSynthesisError,
} = useSpeechSynthesis(messageAsPlainText, {
  lang: 'en-US',
  pitch: 1,
  rate: 0.9,
  volume: 1,
})

// Split text into smaller chunks to improve stability
async function speakWithRetry() {
  try {
    // Cancel any ongoing speech
    window.speechSynthesis?.cancel()

    // Small delay to ensure clean state
    await new Promise(resolve => setTimeout(resolve, 50))

    // Resume synthesis to prevent auto-stopping
    window.speechSynthesis?.resume()

    speakText()

    // Periodically resume to prevent auto-stopping
    const keepAlive = setInterval(() => {
      if (isSpeaking.value) {
        window.speechSynthesis?.resume()
      } else {
        clearInterval(keepAlive)
      }
    }, 5000)

    // Cleanup interval when component is unmounted
    onUnmounted(() => {
      clearInterval(keepAlive)
    })
  } catch (error) {
    console.error('Speech synthesis error:', error)
    stopSpeaking()
    speechSynthesisStatus.value = 'init'
  }
}

watch(currentUtterance, (utterance) => {
  if (utterance) {
    utterance.onend = () => {
      stopSpeaking()
      speechSynthesisStatus.value = 'init'
    }
    utterance.onerror = (event) => {
      console.error('Utterance error:', event)
      stopSpeaking()
      speechSynthesisStatus.value = 'init'
    }
  }
})

watch(speechSynthesisError, (error) => {
  if (error) {
    console.error('Speech synthesis error:', error)
    stopSpeaking()
    speechSynthesisStatus.value = 'init'
  }
})
</script>

<template>
  <div class="flex flex-wrap items-center gap-1 mb-1">
    <ShadcnTooltipProvider>
      <ShadcnTooltip>
        <ShadcnTooltipTrigger as-child>
          <ShadcnButton
            variant="ghost"
            size="icon"
            :disabled="
              !isSpeechSynthesisSupported || messageAsPlainText.trim() === ''
            "
            @click="
              () => {
                if (isSpeaking) {
                  stopSpeaking()
                }
                else {
                  speakWithRetry()
                }
              }
            "
          >
            <template v-if="isSpeaking">
              <CirclePause class="w-6 h-6 text-foreground" />
            </template>
            <template v-else>
              <Volume2 class="w-6 h-6 text-foreground" />
            </template>
          </ShadcnButton>
        </ShadcnTooltipTrigger>
        <ShadcnTooltipContent side="top">
          Read Message
        </ShadcnTooltipContent>
      </ShadcnTooltip>
      <ShadcnTooltip>
        <ShadcnTooltipTrigger as-child>
          <CopyToClipboard
            class="text-foreground"
            :text="messageAsPlainText"
            variant="ghost"
          />
        </ShadcnTooltipTrigger>
        <ShadcnTooltipContent side="top">
          Copy to Clipboard
        </ShadcnTooltipContent>
      </ShadcnTooltip>
    </ShadcnTooltipProvider>
  </div>
</template>

<style scoped></style>
