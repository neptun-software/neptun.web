<script lang="ts" setup>
import type { BundledLanguage } from 'shiki'
import type { TemplateCollectionWithTemplatesWithoutIds as TemplateData } from './types'
import { downloadTemplateHandler } from './functions'

const props = defineProps<{
  collection: TemplateData
  fullWidth?: boolean
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
  <div class="p-2 border rounded-md" :class="[{ 'lg:col-span-2': fullWidth }]">
    <div class="flex justify-between pb-2">
      <h3 class="text-lg font-bold">
        {{ collection.name }}
      </h3>

      <div class="flex items-center gap-2">
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
        <ShadcnScrollArea class="max-w-full">
          <ShadcnTabsList class="flex justify-start flex-grow">
            <ShadcnScrollBar orientation="horizontal" />
            <ShadcnTabsTrigger
              v-for="(template, templateIndex) in collection.templates"
              :key="templateIndex"
              :value="templateIndex"
            >
              <code>{{ template.file_name }}</code>
            </ShadcnTabsTrigger>
          </ShadcnTabsList>
        </ShadcnScrollArea>

        <ShadcnTabsContent
          v-for="(template, templateIndex) in collection.templates"
          :key="templateIndex"
          class="relative"
          :value="templateIndex"
        >
          <ShadcnScrollArea class="px-2 py-1 border rounded-md bg-accent">
            <div class="max-h-[50vh]">
              <MarkdownRenderer
                :content="`\`\`\`${supportedShikiLanguages.includes(template.language as BundledLanguage) ? template.language : 'text'}\n${template.text?.trim()} \n\`\`\``"
                :unique-key="`collection-${collection.id}-template-${template.id}`"
              />
            </div>
            <ShadcnScrollBar orientation="vertical" />
          </ShadcnScrollArea>

          <div class="absolute top-0 right-0">
            <CopyToClipboard :text="template.text?.trim()" />
          </div>
        </ShadcnTabsContent>
      </ShadcnTabs>
    </div>
    <div v-else class="text-center text-gray-500">
      No templates available
    </div>
  </div>
</template>
