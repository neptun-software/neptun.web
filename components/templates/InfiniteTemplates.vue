<script lang="ts" setup>
const { data: apiData } = await useFetch<any[]>(
  'https://66c8ddab8a477f50dc2f7766.mockapi.io/api/v1/Template'
);

const el = ref<HTMLElement | null>(null);
const data = ref<any[]>([]);

useInfiniteScroll(
  el,
  () => {
    data.value.push(...(apiData.value ?? []));
  },
  { distance: 10 }
);

function resetList() {
  data.value = [];
}
</script>

<template>
  <div>
    Coming soon...
    <!-- <ShadcnScrollArea class="h-60">
      <div
        ref="el"
        class="flex flex-col gap-2 p-4 m-auto rounded bg-gray-500/5"
      >
        <div
          v-for="item in data"
          :key="item.id"
          class="p-3 rounded h-15 bg-gray-500/5"
        >
          {{ item }}
        </div>
      </div>
    </ShadcnScrollArea>
    <ShadcnButton @click="resetList()">Reset</ShadcnButton> -->
  </div>
</template>

<style scoped></style>
