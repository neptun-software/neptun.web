<script setup lang="ts">
import { parseMarkdown } from '@nuxtjs/mdc/runtime'
import { Loader2 } from 'lucide-vue-next'

const props = defineProps<{
  content: string
}>()

const contentHash = computed(() => {
  let hash = 0
  for (let i = 0; i < props.content.length; i++) {
    const char = props.content.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36)
})

const { data: ast, status } = await useAsyncData(
  `md-${contentHash.value}`,
  () => parseMarkdown(props.content || 'No content'),
  {
    lazy: true,
  },
)
</script>

<template>
  <div class="relative">
    <div class="break-words whitespace-pre-wrap">
      <template v-if="status === 'success' && ast">
        <!-- MDC is too slow and offers no feedback to the user as well as no great fallback -->
        <MDCRenderer :body="ast.body" :data="ast.data" />
      </template>
      <template v-else>
        {{ content }}
      </template>
    </div>

    <div
      v-show="status === 'pending'"
      class="absolute w-4 h-4 -translate-x-1/2 top-2 left-1/2"
    >
      <Loader2 class="w-full h-full text-blue-500 animate-spin" />
    </div>
  </div>
</template>

<style lang="postcss" scoped></style>
