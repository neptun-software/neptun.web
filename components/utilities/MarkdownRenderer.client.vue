<script setup lang="ts">
import { parseMarkdown } from '@nuxtjs/mdc/runtime'
import { Loader2 } from 'lucide-vue-next'

const props = defineProps<{
  content: string
  uniqueKey?: string
  useSimpleRenderer?: boolean
}>()

// TODO: only render, if not plain/text
const { data: ast, status } = await useAsyncData(
  `md-${props.uniqueKey ?? crypto.randomUUID()}`,
  () => parseMarkdown(props.content || 'No content'),
  {
    lazy: true,
    watch: [() => props.content],
  },
)
</script>

<template>
  <div class="relative">
    <template v-if="!useSimpleRenderer">
      <ShadcnScrollArea id="complex-markdown-renderer" class="w-full">
        <div class="text-sm whitespace-pre-wrap break-words md:text-base" style="max-width: 50vw; max-height: 50vh;">
          <template v-if="status === 'success' && ast">
            <!-- MDC is too slow and offers no feedback to the user as well as no great fallback -->
            <MDCRenderer :body="ast.body" :data="ast.data" />
          </template>
          <template v-else>
            {{ content }}
          </template>
        </div>
        <ShadcnScrollBar orientation="horizontal" />
        <ShadcnScrollBar orientation="vertical" />
      </ShadcnScrollArea>
    </template>
    <template v-else>
      <div class="text-sm whitespace-pre-wrap break-all md:text-base">
        <template v-if="status === 'success' && ast">
          <!-- MDC is too slow and offers no feedback to the user as well as no great fallback -->
          <MDCRenderer :body="ast.body" :data="ast.data" />
        </template>
        <template v-else>
          {{ content }}
        </template>
      </div>
    </template>

    <div
      v-show="status === 'pending'"
      class="absolute top-2 left-1/2 w-4 h-4 -translate-x-1/2 md:w-6 md:h-6"
    >
      <Loader2 class="w-full h-full text-blue-500 animate-spin" />
    </div>
  </div>
</template>

<style lang="postcss" scoped>
#complex-markdown-renderer {
  :deep(pre) {
    white-space: pre;
    max-width: 100%;
    font-size: 0.875rem;
    line-height: 1.25rem;
    @screen md {
      font-size: 1rem;
      line-height: 1.5rem;
    }
  }

  :deep(code) {
    white-space: pre;
  }
}
</style>
