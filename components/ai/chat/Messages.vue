<script lang="ts" setup>
import type { Message } from '@ai-sdk/vue';
import { render } from 'vue';
import CopyToClipboard from '~/components/utils/CopyToClipboard.vue';

defineProps<{
  messages: Message[]
}>();

const $messagesList = ref<HTMLElement | null>(null);

// adds "copy code" button to each code block
onMounted(() => {
  if ($messagesList.value) {
    useMutationObserver(
      $messagesList.value,
      (_mutations) => {
        const shikiElement = $messagesList.value?.querySelectorAll('.shiki');
        if (shikiElement) {
          // pre tag with class="language-<some-language> shiki"
          for (const codeBlock of shikiElement) {
            if (!codeBlock.classList.contains('relative')) {
              codeBlock.classList.add(
                'relative',
                'min-h-[calc(1.25rem+1rem+(2*0.5rem))]'
              );

              // creates a Vue component instance
              const copyComponent = h(CopyToClipboard, {
                class:
                  'absolute top-2 right-2 transition opacity-20 hover:opacity-100',
                text: codeBlock.textContent ?? 'NO CODE' // TODO: parse mime type out of className language-<some-language> and validate it => else text
              });

              render(copyComponent, codeBlock);
            }
          }
        }
      },
      {
        childList: true,
        subtree: true
      }
    );
  }
});
</script>

<template>
  <div ref="$messagesList">
    <template
      v-for="message in messages"
      :key="message.id"
    >
      <AiChatMessage :message="message" />
    </template>
  </div>
</template>

<style scoped></style>
