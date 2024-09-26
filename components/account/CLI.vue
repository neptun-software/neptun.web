<script lang="ts" setup>
import { Download } from 'lucide-vue-next';

const { selectedAiChat } = useSelectedAiChat();
const { user } = useUserSession();

const { data, error } = await useFetch(
  `/api/users/${user.value?.id ?? -1}/cli`
);

const selectedAiChatId = computed(() => selectedAiChat.value.id);
const selectedAiChatName = computed(() => selectedAiChat.value.name);
const selectedAiChatModel = computed(() => selectedAiChat.value.model);
const cliConfigurationToCopy = computed(() => {
  return {
    ...data.value,
    active_chat: {
      chat_id: selectedAiChatId.value,
      chat_name: selectedAiChatName.value,
      model: selectedAiChatModel.value
    }
  }
});

const cliConfigurationMarkdown = computed(() => {
  return `\`\`\`json\n${JSON.stringify(
    cliConfigurationToCopy.value,
    null,
    2
  )}\n\`\`\``;
})

const textForClipboard = computed(() => {
  return JSON.stringify(cliConfigurationToCopy.value, null, 2);
})

async function downloadConfiguration() {
  await downloadAsFile(cliConfigurationToCopy.value, 'neptun-config');
}
</script>

<template>
  <div
    class="relative px-4 py-2 my-2 border rounded-lg bg-background border-slate-200 dark:border-border"
  >
    <ShadcnScrollArea class="max-w-[calc(100vw-8rem)]">
      <ShadcnScrollBar orientation="horizontal" />
      <div>
        <ClientOnly fallback-tag="div">
          <MDC
            class="break-words whitespace-pre-wrap"
            :value="cliConfigurationMarkdown"
          />
          <template #fallback>
            <ShadcnSkeleton class="w-full h-10 bg-slate-400" />
          </template>
          <template v-if="error">
            <p class="text-red-500">
              Failed to fetch CLI configuration.
            </p>
          </template>
          <span class="absolute right-0 flex items-center gap-2 top-2">
            <ShadcnButton
              type="button"
              size="icon"
              variant="ghost"
              :disabled="textForClipboard === ''"
              @click="downloadConfiguration"
            >
              <Download class="size-6" />
            </ShadcnButton>
            <ShadcnButton
              type="button"
              size="icon"
              variant="ghost"
              :disabled="textForClipboard === ''"
            >
              <CopyToClipboard :text="textForClipboard" />
            </ShadcnButton>
          </span>
        </ClientOnly>
      </div>
    </ShadcnScrollArea>
  </div>
</template>

<style scoped></style>
