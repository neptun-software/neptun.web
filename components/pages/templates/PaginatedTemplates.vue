<script setup lang="ts">
import type { TemplateData } from '~/lib/(templates)/templates';

const { totalItems, isLoading, fetchPaginatedData } = useTemplates();
const templates = ref<TemplateData[]>([]);
const pageSize = ref(2);
const page = ref(1);

fetchPaginatedData(page.value, pageSize.value, templates);

const { currentPage, pageCount, isFirstPage, isLastPage, prev, next } =
  useOffsetPagination({
    total: totalItems.value,
    page: page,
    pageSize,
    onPageChange: ({ currentPage, currentPageSize }) => {
      fetchPaginatedData(currentPage, currentPageSize, templates);
    },
    onPageSizeChange: ({ currentPage, currentPageSize }) => {
      fetchPaginatedData(currentPage, currentPageSize, templates);
    },
  });
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
        v-for="(item, index) in pageCount"
        :key="index"
        :disabled="currentPage === item"
        @click="currentPage = item"
      >
        {{ item }}
      </ShadcnButton>
      <ShadcnButton :disabled="isLastPage" @click="next"> next </ShadcnButton>
    </div>

    <Templates :templates="templates" :isLoading="isLoading"></Templates>
  </div>
</template>

<style scoped></style>
