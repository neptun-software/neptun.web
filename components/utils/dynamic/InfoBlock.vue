<script lang="ts" setup>
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-vue-next'

// TODO: add variants: success, error, info...
const props = defineProps<{
  isVisible?: boolean
  showLoader?: boolean
  showDots?: boolean
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <!-- NOTE: v-if (DOM-manipulation) is server-side and v-show (CSS-manipulation) client-side -->
  <div
    v-show="isVisible"
    :class="
      cn(
        'flex items-center justify-center gap-2 px-3 py-2 mb-2 border border-blue-200 rounded-lg bg-background',
        props.class,
      )
    "
  >
    <Loader2 class="w-4 h-4 mr-1 text-blue-500 animate-spin" />
    <p class="flex-grow">
      <slot /><LoadingDots />
    </p>
  </div>
</template>

<style scoped></style>
