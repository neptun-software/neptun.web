<script lang="ts" setup>
import { cn } from '@/lib/utils'
import { Loader2, CircleCheck, CircleX } from 'lucide-vue-next'
import { DynamicToastStates } from './DynamicToastStates'
import type { HTMLAttributes } from 'vue'

function isComputedRef(value: any): value is ComputedRef<DynamicToastStates> {
  return value && typeof value === 'object' && 'value' in value
}

const props = defineProps<{
  state?: DynamicToastStates | ComputedRef<DynamicToastStates>
  class?: HTMLAttributes['class']
}>()

const currentState = computed<DynamicToastStates | undefined>(() => {
  if (!props.state) return undefined
  return isComputedRef(props.state) ? props.state.value : props.state
})
</script>

<template>
  <div
    :class="
      cn(
        'flex items-center gap-2 px-4 py-3 bg-background text-foreground min-h-[3.5rem] w-[356px] [&:has(button)]:pr-16 rounded-lg',
        props.class,
      )
    "
  >
    <Loader2 v-if="currentState === DynamicToastStates.LOADING" class="w-4 h-4 text-blue-500 animate-spin shrink-0" />
    <CircleCheck v-else-if="currentState === DynamicToastStates.SUCCESS" class="w-4 h-4 text-green-500 shrink-0" />
    <CircleX v-else class="w-4 h-4 text-red-500 shrink-0" />
    <p class="flex-grow text-sm">
      <slot />
    </p>
  </div>
</template>

<style scoped></style>
