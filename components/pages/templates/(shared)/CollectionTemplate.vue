<script lang="ts" setup>
import type { BundledLanguage } from 'shiki'
import type { TemplateCollectionWithTemplatesWithoutIds as TemplateData } from './types'
import { downloadTemplateHandler } from './functions'

const props = defineProps<{
  collection: TemplateData
  fullWidth?: boolean
  useSimpleRenderer?: boolean
}>()

const defaultTab = ref(0)

const requestUrl = useRequestURL()
const shareUrl = computed(() =>
  props.collection.is_shared && props.collection.share_uuid !== 'static-template'
    ? `http${IS_DEV ? '' : 's'}://${requestUrl.host}/shared/collections/${props.collection.share_uuid}`
    : null,
)
</script>

<template>
  <div class="p-2 rounded-md border" :class="[{ 'lg:col-span-2': fullWidth }]">
    <div class="flex justify-between pb-2">
      <h3 class="text-lg font-bold">
        {{ collection.name }}
      </h3>

      <div class="flex gap-2 items-center">
        <CopyToClipboard
          v-if="collection.is_shared && shareUrl"
          :text="shareUrl"
          variant="outline"
        >
          Share URL
        </CopyToClipboard>
        <AsyncButton :on-click-async="downloadTemplateHandler(collection)">
          Download
        </AsyncButton>
      </div>
    </div>

    <div v-if="collection.templates.length > 0">
      <ShadcnTabs
        :default-value="defaultTab"
        class="w-full"
      >
        <ShadcnScrollArea class="max-w-full rounded-md bg-accent">
          <ShadcnTabsList class="flex flex-grow justify-start">
            <ShadcnTabsTrigger
              v-for="(template, templateIndex) in collection.templates"
              :key="templateIndex"
              :value="templateIndex"
            >
              <code>{{ template.file_name }}</code>
            </ShadcnTabsTrigger>
          </ShadcnTabsList>
          <ShadcnScrollBar orientation="horizontal" />
        </ShadcnScrollArea>

        <ShadcnTabsContent
          v-for="(template, templateIndex) in collection.templates"
          :key="templateIndex"
          class="relative"
          :value="templateIndex"
        >
          <div class="relative">
            <ShadcnScrollArea class="px-2 py-1 w-full rounded-md border bg-accent" style="max-height: 50vh;">
              <div class="w-full">
                <MarkdownRenderer
                  :content="`\`\`\`${supportedShikiLanguages.includes(template.language as BundledLanguage) ? template.language : 'text'}\n${template.text?.trim()} \n\`\`\``"
                  :unique-key="`collection-${collection.id}-template-${template.id}`"
                  :use-simple-renderer="useSimpleRenderer"
                />
              </div>
              <ShadcnScrollBar orientation="vertical" />
            </ShadcnScrollArea>

            <div class="absolute top-0 right-0">
              <CopyToClipboard :text="template.text?.trim()" />
            </div>
          </div>
        </ShadcnTabsContent>
      </ShadcnTabs>
    </div>
    <div v-else class="text-center text-gray-500">
      No templates available
    </div>
  </div>
</template>
