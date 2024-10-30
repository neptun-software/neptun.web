<script lang="ts" setup>
import type { BundledLanguage } from 'shiki';
import type { TemplateData } from '~/lib/(templates)/templates';
import { Loader2 } from 'lucide-vue-next';
import { downloadTemplateZip } from './functions';

defineProps<{
  templates: TemplateData[];
  isLoading: boolean;
}>();
</script>

<template>
  <div>
    <div
      v-if="isLoading"
      class="flex items-center justify-center gap-2 px-3 py-2 mt-2 border border-blue-200 rounded-lg bg-background"
    >
      <Loader2 class="w-4 h-4 mr-1 text-blue-500 animate-spin" />
      <p class="flex-grow">Loading templates<LoadingDots /></p>
    </div>

    <div
      v-if="templates.length > 0"
      class="grid grid-cols-1 gap-2 lg:grid-cols-2"
    >
      <div
        v-for="template in templates"
        :key="template.id"
        class="p-2 border rounded-md"
      >
        <div class="flex justify-between pb-2">
          <h3 class="text-lg font-bold">
            {{ template.name }}
          </h3>
          <ShadcnButton @click="downloadTemplateZip(template)">
            download
          </ShadcnButton>
        </div>

        <div v-if="template.readme" class="border rounded-md">
          {{ template.readme }}
        </div>

        <ShadcnTabs :default-value="template.code[0].fileName" class="w-full">
          <ShadcnScrollArea class="max-w-full">
            <ShadcnTabsList class="flex justify-start flex-grow">
              <ShadcnScrollBar orientation="horizontal" />
              <ShadcnTabsTrigger
                v-for="(c, index) in template.code"
                :key="index"
                :value="c.fileName"
              >
                <code>
                  {{ c.fileName }}
                </code>
              </ShadcnTabsTrigger>
            </ShadcnTabsList>
          </ShadcnScrollArea>
          <ShadcnTabsContent
            v-for="(c, index) in template.code"
            :key="index"
            class="relative"
            :value="c.fileName"
          >
            <ShadcnScrollArea class="h-screen px-2 py-1 border rounded-md">
              <ClientOnly>
                <MDC
                  :value="`\`\`\`${
                    supportedShikiLanguages.includes(
                      c.fileName.split('.')[
                        c.fileName.split('.').length - 1
                      ] as BundledLanguage
                    )
                      ? c.fileName.split('.')[c.fileName.split('.').length - 1]
                      : 'text'
                  }\n${c.code?.trim()} \n\`\`\``"
                />
                <template #fallback>
                  <div class="overflow-x-auto break-words whitespace-pre-wrap">
                    {{ c.code }}
                  </div>
                </template>
              </ClientOnly>
            </ShadcnScrollArea>

            <div class="absolute top-0 right-0">
              <CopyToClipboard :text="c.code?.trim()" />
            </div>
          </ShadcnTabsContent>
        </ShadcnTabs>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
