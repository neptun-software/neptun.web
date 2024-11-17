<script lang="ts" setup>
import type { BundledLanguage } from 'shiki';
import type { TemplateData } from '~/lib/(templates)/templates';
import { downloadTemplateHandler } from './functions';

defineProps<{
  templates: TemplateData[];
  isLoading: boolean;
}>();
</script>

<template>
  <div>
    <InfoBlock showLoader showDots :isVisible="isLoading" class="mt-0 mb-2">
      Loading templates
    </InfoBlock>

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

          <AsyncButton :onClickAsync="downloadTemplateHandler(template)">
            download
          </AsyncButton>
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
