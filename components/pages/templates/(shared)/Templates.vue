<script lang="ts" setup>
import type { BundledLanguage } from 'shiki'
import type { TemplateCollectionWithTemplatesWithoutIds as TemplateData } from '~/components/pages/templates/(shared)/types'
import { downloadTemplateHandler } from './functions'

defineProps<{
  collections: TemplateData[]
  isLoading: boolean
}>()
</script>

<template>
  <div>
    <InfoBlock show-loader show-dots :is-visible="isLoading" class="mt-0 mb-2">
      Loading templates
    </InfoBlock>

    <div
      v-if="collections.length > 0"
      class="grid grid-cols-1 gap-2 lg:grid-cols-2"
    >
      <div
        v-for="(collection, collectionIndex) in collections"
        :key="collectionIndex"
        class="p-2 border rounded-md"
      >
        <div class="flex justify-between pb-2">
          <h3 class="text-lg font-bold">
            {{ collection.name }}
          </h3>

          <AsyncButton :on-click-async="downloadTemplateHandler(collection)">
            download
          </AsyncButton>
        </div>

        <ShadcnTabs
          :default-value="collection.templates[0]?.file_name"
          class="w-full"
        >
          <ShadcnScrollArea class="max-w-full">
            <ShadcnTabsList class="flex justify-start flex-grow">
              <ShadcnScrollBar orientation="horizontal" />
              <ShadcnTabsTrigger
                v-for="(template, templateIndex) in collection.templates"
                :key="templateIndex"
                :value="template.file_name"
              >
                <code>{{ template.file_name }}</code>
              </ShadcnTabsTrigger>
            </ShadcnTabsList>
          </ShadcnScrollArea>

          <ShadcnTabsContent
            v-for="(template, templateBodyIndex) in collection.templates"
            :key="templateBodyIndex"
            class="relative"
            :value="template.file_name"
          >
            <ShadcnScrollArea class="h-screen px-2 py-1 border rounded-md bg-accent">
              <ClientOnly>
                <!-- MDC is not flexible enough -->
                <MarkdownRenderer
                  :content="`\`\`\`${supportedShikiLanguages.includes(template.language as BundledLanguage) ? template.language : 'text'}\n${template.text?.trim()} \n\`\`\``"
                />
                <template #fallback>
                  <div class="overflow-x-auto break-words whitespace-pre-wrap">
                    {{ template.text }}
                  </div>
                </template>
              </ClientOnly>
            </ShadcnScrollArea>

            <div class="absolute top-0 right-0">
              <CopyToClipboard :text="template.text?.trim()" />
            </div>
          </ShadcnTabsContent>
        </ShadcnTabs>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
