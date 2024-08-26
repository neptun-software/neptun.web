<script lang="ts" setup>
// TODO: fix resizable only working if page is completely rerendered

const { selectedAiChatKey } = useSelectedAiChat();
const { width } = useWindowSize();
const isInfoHidden = ref(false);
</script>

<template>
  <div class="h-full">
    <ClientOnly>
      <!-- TODO: replace with css, instead of useWindowSize, so that it doesn't take so long, because everything is rendered on the client, every time -->
      <ShadcnResizablePanelGroup
        v-if="width >= 1024"
        id="handle-group-1"
        direction="horizontal"
        class="max-w-full mt-2"
      >
        <ShadcnResizablePanel
          id="handle-panel-1"
          v-bind:class="{
            hidden: isInfoHidden,
          }"
          :min-size="25"
          :default-size="25"
        >
          <AiChatTabs />
        </ShadcnResizablePanel>
        <ShadcnResizableHandle
          id="handle-handle-1"
          @click="isInfoHidden = !isInfoHidden"
          with-handle
        />
        <ShadcnResizablePanel
          id="handle-panel-2"
          :min-size="50"
          :default-size="75"
          class="px-2"
        >
          <AiChat :key="selectedAiChatKey" />
          <!-- MESSAGES OF CHAT (needs key, to rerender chat, so that useChat gets a new ID, useChat can not be put anywhere als then the setup script, because some functionality depends on that environment) -->
        </ShadcnResizablePanel>
      </ShadcnResizablePanelGroup>
      <div v-else class="pt-2 pr-2">
        <AiChat :key="selectedAiChatKey" />
      </div>
      <template #fallback>
        <div class="pt-2 pr-2">
          <AiChat :key="selectedAiChatKey" />
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped></style>
