<script lang="ts" setup>
import { Vue3Lottie } from 'vue3-lottie';

const props = defineProps<{
  animationIsActive?: boolean;
  animationLink: string;
}>();

// pauseAnimation prop only works 2 times somehow, that is why I have to rerender every time
const animationKey = computed(() =>
  props.animationIsActive ? 'active' : 'inactive'
);

const animationKeyRef = ref(animationKey.value);
watch(
  () => props.animationIsActive,
  (newVal) => {
    animationKeyRef.value = newVal ? 'active' : 'inactive';
  }
);
</script>

<template>
  <div class="w-5 h-5 ml-1">
    <ClientOnly>
      <Vue3Lottie
        :key="animationKey"
        :animationLink="animationLink"
        :height="20"
        :width="20"
        :autoPlay="animationIsActive"
        :loop="false"
        :playOnHover="false"
      />
      <template #fallback>
        <slot></slot>
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped></style>
