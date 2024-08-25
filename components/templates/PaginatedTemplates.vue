<script setup lang="ts">
import { templates, type TemplateData } from '~/lib/(templates)/templates';

const database = ref(templates) as Ref<TemplateData[]>;

function fetch(page: number, pageSize: number) {
  return new Promise<TemplateData[]>((resolve, reject) => {
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
  fetch(currentPage, currentPageSize).then((responseData) => {
    data.value = responseData;
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
  <DevOnly>
    <div class="inline-grid items-center grid-cols-2 gap-x-4">
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
  </DevOnly>
  <div class="flex gap-1 my-4">
    <ShadcnButton :disabled="isFirstPage" @click="prev">prev</ShadcnButton>
    <ShadcnButton
      v-for="item in pageCount"
      :key="item"
      :disabled="currentPage === item"
      @click="currentPage = item"
    >
      {{ item }}
    </ShadcnButton>
    <ShadcnButton :disabled="isLastPage" @click="next">next</ShadcnButton>
  </div>

  <div class="grid grid-cols-1 gap-2 lg:grid-cols-2" v-if="data.length > 0">
    <div class="px-4 py-2 border rounded-md" v-for="d in data" :key="d.id">
      <h3 class="text-lg font-bold">{{ d.name }}</h3>
      <div v-if="d.readme" class="border rounded-md">{{ d.readme }}</div>
      <div v-for="c in d.code" :key="useSsrSaveId.toString()">
        <code>
          {{ c.fileName }}
        </code>

        <div class="px-2 py-1 border rounded-md">
          <ClientOnly>
            <MDC :value="c.code" />
            <template #fallback>
              <div class="overflow-x-auto break-words whitespace-pre-wrap">
                {{ c.code }}
              </div>
            </template>
          </ClientOnly>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
