<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <footer :class="cn('flex z-10 flex-col border-t bg-background p-8 justify-center', props.class)">
    <AppLinks />
    <p class="mt-2 text-center text-muted-foreground">
      Animated Icons by
      <NuxtLink
        class="hover:underline"
        to="https://useanimations.com/"
        external
      >
        useanimations
      </NuxtLink>
    </p>
  </footer>
</template>
