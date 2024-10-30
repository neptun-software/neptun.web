<script setup lang="ts">
import type { BundledLanguage } from 'shiki';
import { Loader2 } from 'lucide-vue-next';
import { templates, type TemplateData } from '~/lib/(templates)/templates';

const database = ref(templates) as Ref<TemplateData[]>;
const data: Ref<TemplateData[]> = ref([]);

const pageSize = ref(2);
const loading = ref(false);
const page = ref(1);

function fetch(page: number, pageSize: number) {
  return new Promise<TemplateData[]>((resolve) => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    setTimeout(() => {
      resolve(database.value.slice(start, end));
    }, 100);
  });
}

async function loadMore() {
  if (loading.value || data.value.length >= database.value.length) return;

  loading.value = true;
  const responseData = await fetch(page.value, pageSize.value);

  if (responseData.length > 0) {
    data.value = [...data.value, ...responseData];
    page.value += 1;
  }

  loading.value = false;
}

useInfiniteScroll(document, loadMore, {
  distance: 100
});
</script>

<template>
  <div
    v-if="data.length > 0"
    class="grid grid-cols-1 gap-2 lg:grid-cols-2"
  >
    <div
      v-for="d in data"
      :key="d.id"
      class="p-2 border rounded-md"
    >
      <h3 class="text-lg font-bold">
        {{ d.name }}
      </h3>
      <div
        v-if="d.readme"
        class="border rounded-md"
      >
        {{ d.readme }}
      </div>

      <ShadcnTabs
        :default-value="d.code[0].fileName"
        class="w-full"
      >
        <ShadcnScrollArea class="max-w-full">
          <ShadcnTabsList class="flex justify-start flex-grow">
            <ShadcnScrollBar orientation="horizontal" />
            <ShadcnTabsTrigger
              v-for="(c, index) in d.code"
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
          v-for="(c, index) in d.code"
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

  <div
    v-if="loading"
    class="flex items-center justify-center gap-2 px-3 py-2 mt-2 border border-blue-200 rounded-lg bg-background"
  >
    <Loader2 class="w-4 h-4 mr-1 text-blue-500 animate-spin" />
    <p class="flex-grow">
      Loading more templates<LoadingDots />
    </p>
  </div>

  <div
    v-else-if="!loading && data.length > 0 && data.length === database.length"
    class="flex items-center justify-center gap-2 px-3 py-2 mt-2 border border-blue-200 rounded-lg bg-background"
  >
    <p>You scrolled to the bottom. No more templates to load...</p>
  </div>
</template>

<style scoped></style>
