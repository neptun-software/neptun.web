<script lang="ts" setup>
import { Volume2, CirclePause } from 'lucide-vue-next';

const props = defineProps<{
  message: string;
}>();

const messageAsPlainText = ref(props.message);

onMounted(async () => {
  messageAsPlainText.value = await stripMarkdown(props.message);
});

/* SPEECH SYNTHESIS */
// TODO: find out, why the speaker sometimes suddenly stops
const {
  isSupported: isSpeechSynthesisSupported,
  isPlaying: isSpeaking,
  // status: speechSynthesisStatus,
  // utterance: currentUtterance,
  // error: speechSynthesisError,
  stop: stopSpeaking,
  speak: speakText,
} = useSpeechSynthesis(messageAsPlainText, {
  lang: 'en-US',
  pitch: 1,
  rate: 1,
  volume: 1,
});
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
                if (!isSpeaking) speakText();
                if (isSpeaking) stopSpeaking();
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
        <ShadcnTooltipContent side="top"> Read Message </ShadcnTooltipContent>
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
