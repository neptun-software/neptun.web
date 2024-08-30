<script lang="ts" setup>
const { selectedAiChatKey } = useSelectedAiChat();
const isInfoHidden = ref(false);
</script>

<template>
  <div class="h-full">
    <ClientOnly>
      <!-- Panel group for larger screens -->
      <ShadcnResizablePanelGroup
        id="handle-group-1"
        direction="horizontal"
        class="max-w-full mt-2 panel-group"
      >
        <ShadcnResizablePanel
          id="handle-panel-1"
          :class="{ hidden: isInfoHidden }"
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
          <!-- MESSAGES OF CHAT (needs key, to rerender chat, so that useChat gets a new ID, useChat can not be put anywhere else than the setup script, because some functionality depends on that environment) -->
        </ShadcnResizablePanel>
      </ShadcnResizablePanelGroup>

      <!-- Single panel for smaller screens -->
      <div class="single-panel">
        <AiChat :key="selectedAiChatKey" />
      </div>

      <template #fallback>
        <div class="single-panel">
          <AiChat :key="selectedAiChatKey" />
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
.panel-group {
  display: flex !important;
}

/* Hide the panel group on screens smaller than 1024px */
@media (max-width: 1023px) {
  .panel-group {
    display: none !important;
  }
}

/* Show the single panel only on screens smaller than 1024px */
.single-panel {
  height: 100%;
  display: none !important;
}

@media (max-width: 1023px) {
  .single-panel {
    display: block !important;
    padding-top: 0.5rem;
    padding-right: 0.5rem;
  }
}
</style>
