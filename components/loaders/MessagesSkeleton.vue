<script lang="ts" setup>
const isLoading = ref(false);
const messages = ref<
  { heightClass: string, width: number, justifyClass: string }[]
>([]);
const heights = [
  'h-10',
  'h-11',
  'h-12',
  'h-14',
  'h-16',
  'h-20',
  'h-24',
  'h-28',
  'h-32',
  'h-36',
  'h-40',
  'h-44',
  'h-48',
  'h-52',
  'h-56',
  'h-60',
  'h-64',
  'h-72',
  'h-80',
  'h-96'
]

const generateMessages = () => {
  const amountToGenerate = getRandomInt(2, 8);
  for (let i = 0; i < amountToGenerate; i++) {
    const heightClass = getRandomHeight();
    const width = getRandomWidth();
    const justifyClass = i % 2 === 0 ? 'justify-end' : 'justify-start';

    messages.value.push({ heightClass, width, justifyClass });
  }
};

const getRandomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const getRandomHeight = () => {
  const randomIndex = Math.floor(Math.random() * heights.length);
  return heights[randomIndex];
}

const getRandomWidth = () => {
  const minWidth = 100;
  const maxWidth = 350;
  return Math.floor(Math.random() * (maxWidth - minWidth + 1)) + minWidth;
}

onMounted(() => {
  generateMessages();
})
</script>

<template>
  <div v-if="!isLoading">
    <div
      v-for="(message, index) in messages"
      :key="index"
      :class="['flex my-2', message.justifyClass]"
    >
      <ShadcnSkeleton
        class="px-4 py-2 border rounded-lg border-slate-300 max-w-[80%] relative dark:border-border overflow-x-auto break-words whitespace-pre-wrap"
        :class="message.heightClass"
        :style="{ width: message.width + 'px' }"
      />
    </div>
  </div>
</template>

<style scoped></style>
