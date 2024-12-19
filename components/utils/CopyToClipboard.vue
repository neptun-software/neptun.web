<script lang="ts" setup>
import type { HTMLAttributes } from 'vue'
import type { ButtonVariants } from '../ui/button'
import { Copy, CopyCheck } from 'lucide-vue-next'

const props = defineProps<{
  text: string
  mime?: string
  class?: HTMLAttributes['class']
  variant?: ButtonVariants['variant']
}>()

// const mime = 'text/markdown'; // Unknown error (NotAllowedError: Failed to execute 'write' on 'Clipboard': Type text/markdown not supported on write.)
const mime = props.mime ?? 'text/plain'
const source = computed(() => [
  new ClipboardItem({
    [mime]: new Blob([props.text], { type: mime }),
  }),
])

const {
  // content: copiedText,
  copy: copyToClipboard,
  copied: isCopied,
  isSupported: isClipboardSupported,
} = useClipboardItems({ source })
</script>

<template>
  <div :class="props.class">
    <ShadcnButton
      :variant="variant ?? 'link'"
      size="icon"
      :disabled="!isClipboardSupported || text.trim() === '' || isCopied"
      @click="copyToClipboard(source)"
    >
      <template v-if="isCopied">
        <CopyCheck class="w-5 h-5" />
      </template>
      <template v-else>
        <Copy class="w-5 h-5" />
      </template>
    </ShadcnButton>
  </div>
</template>

<style scoped></style>
