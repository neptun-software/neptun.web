<script lang="ts" setup>
import { Vue3Lottie } from 'vue3-lottie';

const props = defineProps<{
  animationIsActive?: boolean
  animationLink: string
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
  <div class="w-5 h-5 ml-1 animated-icon">
    <ClientOnly>
      <Vue3Lottie
        :key="animationKey"
        :animation-link="animationLink"
        :height="20"
        :width="20"
        :auto-play="animationIsActive"
        :loop="false"
        :play-on-hover="false"
      />
      <template #fallback>
        <slot />
      </template>
    </ClientOnly>
  </div>
</template>

<!-- NOTE: scoped is not enough -->
<style lang="postcss">
.animated-icon svg path {
  fill: none !important;
  stroke-width: 2 !important;
  stroke-linecap: round !important;
  stroke-linejoin: round !important;
  @apply stroke-foreground;
}
</style>
