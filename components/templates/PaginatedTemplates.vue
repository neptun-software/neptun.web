<script setup lang="ts">
import type { BundledLanguage } from 'shiki';
import { Loader2 } from 'lucide-vue-next';
import { templates, type TemplateData } from '~/lib/(templates)/templates';

const database = ref(templates) as Ref<TemplateData[]>;

function fetch(page: number, pageSize: number) {
  return new Promise<TemplateData[]>((resolve, _reject) => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    setTimeout(() => {
      resolve(database.value.slice(start, end));
    }, 100);
  });
}

const data: Ref<TemplateData[]> = ref([]);

const page = ref(1);
const pageSize = ref(2);
const isLoading = ref(false);

fetchData({
  currentPage: page.value,
  currentPageSize: pageSize.value,
});

function fetchData({
  currentPage,
  currentPageSize,
}: {
  currentPage: number;
  currentPageSize: number;
}) {
  isLoading.value = true;
  fetch(currentPage, currentPageSize).then((responseData) => {
    data.value = responseData;
    isLoading.value = false;
  });
}

const {
  currentPage,
  currentPageSize,
  pageCount,
  isFirstPage,
  isLastPage,
  prev,
  next,
} = useOffsetPagination({
  total: database.value.length,
  page: 1,
  pageSize,
  onPageChange: fetchData,
  onPageSizeChange: fetchData,
});

const useSsrSaveId = () => useId();
</script>

<template>
  <div>
    <!-- <DevOnly>
    <div class="inline-grid items-center grid-cols-2 p-4 gap-x-4">
      <div opacity="50">total:</div>
      <div>{{ database.length }}</div>
      <div opacity="50">pageCount:</div>
      <div>{{ pageCount }}</div>
      <div opacity="50">currentPageSize:</div>
      <div>{{ currentPageSize }}</div>
      <div opacity="50">currentPage:</div>
      <div>{{ currentPage }}</div>
      <div opacity="50">isFirstPage:</div>
      <div>{{ isFirstPage }}</div>
      <div opacity="50">isLastPage:</div>
      <div>{{ isLastPage }}</div>
    </div>
  </DevOnly> -->

    <div class="flex gap-1 mb-2">
      <ShadcnButton :disabled="isFirstPage" @click="prev"> prev </ShadcnButton>
      <ShadcnButton
        v-for="item in pageCount"
        :key="item"
        :disabled="currentPage === item"
        @click="currentPage = item"
      >
        {{ item }}
      </ShadcnButton>
      <ShadcnButton :disabled="isLastPage" @click="next"> next </ShadcnButton>
    </div>

    <div
      v-if="isLoading"
      class="flex items-center justify-center gap-2 px-3 py-2 mt-2 border border-blue-200 rounded-lg bg-background"
    >
      <Loader2 class="w-4 h-4 mr-1 text-blue-500 animate-spin" />
      <p class="flex-grow">Loading templates<LoadingDots /></p>
    </div>

    <div v-if="data.length > 0" class="grid grid-cols-1 gap-2 lg:grid-cols-2">
      <div v-for="d in data" :key="d.id" class="p-2 border rounded-md">
        <h3 class="text-lg font-bold">
          {{ d.name }}
        </h3>
        <div v-if="d.readme" class="border rounded-md">
          {{ d.readme }}
        </div>

        <ShadcnTabs :default-value="d.code[0].fileName" class="w-full">
          <ShadcnScrollArea class="max-w-full">
            <ShadcnTabsList class="flex justify-start flex-grow">
              <ShadcnScrollBar orientation="horizontal" />
              <ShadcnTabsTrigger
                v-for="c in d.code"
                :key="useSsrSaveId.toString()"
                :value="c.fileName"
              >
                <code>
                  {{ c.fileName }}
                </code>
              </ShadcnTabsTrigger>
            </ShadcnTabsList>
          </ShadcnScrollArea>
          <ShadcnTabsContent
            v-for="c in d.code"
            :key="useSsrSaveId.toString()"
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
