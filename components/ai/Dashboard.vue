<script lang="ts" setup>
// TODO: fix resizable only working if page is completely rerendered

const { selectedAiChatKey } = useSelectedAiChat();
const { width } = useWindowSize();
</script>

<template>
  <div class="h-full">
    <ShadcnResizablePanelGroup
      v-if="width >= 1024"
      id="handle-group-1"
      direction="horizontal"
      class="max-w-full mt-2"
    >
      <ShadcnResizablePanel
        id="handle-panel-1"
        :min-size="22"
        :default-size="22"
      >
        <AiChatTabs />
      </ShadcnResizablePanel>
      <ShadcnResizableHandle id="handle-handle-1" with-handle />
      <ShadcnResizablePanel
        id="handle-panel-2"
        :min-size="50"
        :default-size="78"
        class="px-2"
      >
        <AiChat :key="selectedAiChatKey" />
        <!-- MESSAGES OF CHAT (needs key, to rerender chat, so that useChat gets a new ID, useChat can not be put anywhere als then the setup script, because some functionality depends on that environment) -->
      </ShadcnResizablePanel>
    </ShadcnResizablePanelGroup>
    <div v-else class="pt-2 pr-2">
      <AiChat :key="selectedAiChatKey" />
    </div>
  </div>
</template>

<style scoped></style>
