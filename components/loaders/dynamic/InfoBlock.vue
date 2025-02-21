<script lang="ts" setup>
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle2, CircleX, Info, Loader2 } from 'lucide-vue-next'
import { computed } from 'vue'

type Variant = 'info' | 'success' | 'error' | 'warning'

const props = defineProps<{
  isVisible?: boolean
  showLoader?: boolean
  showDots?: boolean
  variant?: Variant
  class?: HTMLAttributes['class']
}>()

const variantStyles = {
  info: 'border-blue-200',
  success: 'border-green-200',
  error: 'border-red-200',
  warning: 'border-yellow-200',
}

const variantIcons = {
  info: Info,
  success: CheckCircle2,
  error: CircleX,
  warning: AlertCircle,
}

const variantIconColors = {
  info: 'text-blue-400',
  success: 'text-green-400',
  error: 'text-red-400',
  warning: 'text-yellow-400',
}

const currentVariant = computed(() => props.variant || 'info')
</script>

<template>
  <!-- NOTE: v-if (DOM-manipulation) is server-side and v-show (CSS-manipulation) client-side -->
  <div
    v-show="isVisible"
    :class="
      cn(
        'flex items-center justify-center gap-2 px-3 pr-2 py-2 mb-2 min-h-[50px] border rounded-lg bg-background',
        variantStyles[currentVariant],
        props.class,
      )
    "
  >
    <Loader2 v-if="showLoader" class="mr-1 w-6 h-6 animate-spin" :class="[variantIconColors[currentVariant]]" />
    <component
      :is="variantIcons[currentVariant]"
      v-if="!showLoader"
      class="mr-1 w-6 h-6" :class="[variantIconColors[currentVariant]]"
    />
    <p class="flex-grow">
      <slot /><LoadingDots v-if="showDots" />
    </p>
    <slot name="action" />
  </div>
</template>

<style scoped></style>
