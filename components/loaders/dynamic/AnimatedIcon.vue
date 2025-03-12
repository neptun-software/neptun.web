<script setup lang="ts">
import { ref, watch } from 'vue'
import { Vue3Lottie } from 'vue3-lottie'

interface Props {
  isActive?: boolean
  animationData: any // typeof import("*.json") doesn't match all the time
}

const props = withDefaults(defineProps<Props>(), {
  isActive: false,
})

const $lottieElement = ref()
const isActive = ref(!props.isActive)

function playAnimation(forward: boolean) {
  if (!$lottieElement.value) {
    return
  }
  $lottieElement.value.playSegments(forward ? [0, 10] : [10, 0], true)
}

watch(() => props.isActive, (newValue) => {
  if (newValue !== isActive.value) {
    isActive.value = newValue
    playAnimation(newValue)
  }
})

function handleClick() {
  isActive.value = !isActive.value
  playAnimation(isActive.value)
}
</script>

<template>
  <div class="size-5 animated-icon" @click="handleClick">
    <ClientOnly>
      <Vue3Lottie
        ref="$lottieElement"
        :animation-data="animationData"
        :speed="1"
        :loop="false"
        :auto-play="false"
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
