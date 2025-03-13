<script lang="ts" setup>
definePageMeta({
  name: 'New Project',
  alias: projectAliases,
  middleware: ['protected'],
})

const importTrigger = ref(null)
const isImportActive = ref(false)
const { getTabState, setTabState } = useUiStore()

const projectTab = computed({
  get: () => getTabState('project').value || 'create',
  set: (value) => {
    setTabState('project', value)
  },
})

useMutationObserver(importTrigger, (mutations) => {
  for (const mutation of mutations) {
    if (
      mutation.type === 'attributes'
      && mutation.attributeName === 'data-active'
    ) {
      const target = mutation.target as Element
      isImportActive.value = target.getAttribute('data-active') === 'true'
    }
  }
}, {
  attributes: true,
  attributeFilter: ['data-active'],
})
</script>

<template>
  <div class="flex justify-center card-container">
    <ShadcnCard class="m-2 card" :data-state="isImportActive ? 'import' : 'create'">
      <ShadcnCardHeader>
        <ShadcnCardTitle class="text-4xl">
          Guide - {{ isImportActive ? 'Import' : 'Create' }}
        </ShadcnCardTitle>
        <ShadcnCardDescription class="text-lg">
          This guide will help you get started with Neptun.
        </ShadcnCardDescription>
      </ShadcnCardHeader>
      <ShadcnSeparator class="my-2" />
      <ShadcnCardContent>
        <ShadcnTabs v-model="projectTab" default-value="create" class="w-full">
          <ShadcnTabsList class="flex flex-grow justify-start">
            <ShadcnTabsTrigger value="create" class="tab-trigger">
              Start from Scratch
            </ShadcnTabsTrigger>
            <ShadcnTabsTrigger ref="importTrigger" value="import" class="tab-trigger">
              Import Data
            </ShadcnTabsTrigger>
          </ShadcnTabsList>
          <ShadcnTabsContent value="create" class="p-4 rounded-md border tab-content">
            <p>
              You do not have a project yet. Do you want to start from
              scratch?<br>
              If so, you can create a new project here.
            </p>

            <div class="p-8">
              <FreshProject />
            </div>
          </ShadcnTabsContent>
          <ShadcnTabsContent value="import" class="p-4 rounded-md border tab-content">
            <p>
              You already have a project. Do you want to import it's data?<br>
              If so, you can import data here.
            </p>
            <div class="p-8">
              <DataProject />
            </div>
          </ShadcnTabsContent>
        </ShadcnTabs>
      </ShadcnCardContent>
      <ShadcnSeparator class="my-2" />
      <ShadcnCardFooter>
        If you just want to chat with the AI, click
        <NuxtLink class="ml-1 underline hover:no-underline" to="/chat">
          here
        </NuxtLink>
        .
      </ShadcnCardFooter>
    </ShadcnCard>
  </div>
</template>

<style scoped>
.card-container {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 1rem;
}

.card {
  width: 100%;
  max-width: min(90vw, 1000px);
  transition: all 0.3s ease;
}

:deep(.tab-content) {
  transition: opacity 0.3s ease;
}

:deep(.tab-trigger) {
  flex: 1;
}

:deep(.tabs-list) {
  width: 100%;
  display: flex;
}

@media (max-width: 640px) {
  .card-container {
    padding: 0.5rem;
  }

  :deep(.tab-trigger) {
    padding: 0.5rem;
    font-size: 0.875rem;
  }
}
</style>
