<script lang="ts" setup>
definePageMeta({
  name: 'New Project',
  alias: projectAliases,
  middleware: ['protected'],
})

const importTrigger = ref(null)
const isImportActive = ref(false)

useMutationObserver(importTrigger, (mutations) => {
  for (const mutation of mutations) {
    if (
      mutation.type === 'attributes' &&
      mutation.attributeName === 'data-active'
    ) {
      const target = mutation.target as Element
      isImportActive.value = target.getAttribute('data-active') === 'true'
    }
  }
}, {
  attributes: true,
  attributeFilter: ['data-active']
})
</script>

<template>
  <div class="flex justify-center card" :data-state="isImportActive ? 'import' : 'create'">
    <ShadcnCard class="m-2 max-w-full w-fit">
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
        <ShadcnTabs default-value="create" class="w-full">
          <ShadcnTabsList class="flex flex-grow justify-start">
            <ShadcnTabsTrigger value="create" class="tab-trigger">
              Start from Scratch
            </ShadcnTabsTrigger>
            <ShadcnTabsTrigger value="import" class="tab-trigger" ref="importTrigger">
              Import Data
            </ShadcnTabsTrigger>
          </ShadcnTabsList>
          <ShadcnTabsContent value="create" class="p-4 rounded-md border tab-content" ref="card">
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
/* TODO: find a solution to animate the card */

:deep(.card[data-state='create']) {
  width: 0;
  overflow: hidden;
  transition: width 0.2s ease-in-out;
}

:deep(.card[data-state='import']) {
  width: auto;
  width: calc-size(auto, size);
}

:deep(.tab-trigger) {
  flex: 1;
}
</style>
