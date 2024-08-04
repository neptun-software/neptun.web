<script lang="ts" setup>
definePageMeta({
  name: 'Guide',
  middleware: ['protected'],
});
</script>

<template>
  <div class="flex justify-center">
    <ShadcnCard class="max-w-full m-2 w-fit">
      <ShadcnCardHeader>
        <ShadcnCardTitle class="text-4xl"> Guide (WIP) </ShadcnCardTitle>
        <ShadcnCardDescription class="text-lg">
          This guide will help you get started with Neptun.
        </ShadcnCardDescription>
      </ShadcnCardHeader>
      <ShadcnSeparator class="my-2" />
      <ShadcnCardContent>
        <ShadcnTabs default-value="create" class="w-full">
          <ShadcnTabsList class="flex justify-start flex-grow">
            <ShadcnTabsTrigger value="create">
              Start from Scratch
            </ShadcnTabsTrigger>
            <ShadcnTabsTrigger value="update"> Import Data </ShadcnTabsTrigger>
          </ShadcnTabsList>
          <ShadcnTabsContent value="create" class="p-4 border rounded-md">
            <p>
              You do not have a project yet. Do you want to start from
              scratch?<br />
              If so, you can create a new project here.
            </p>

            <div class="p-8">
              <FreshProject />
            </div>
          </ShadcnTabsContent>
          <ShadcnTabsContent value="update" class="p-4 border rounded-md">
            <p>
              You already have a project. Do you want to import it's data?<br />
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

<style scoped></style>
