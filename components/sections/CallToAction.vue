<script setup lang="ts">
import { gsap } from 'gsap'

defineProps<{
  text?: string
  href?: string
}>()

const magneticButton = ref<HTMLButtonElement | null>(null)
const boundingRect = ref<DOMRect | null>(null)

function updateBoundingRect() {
  if (magneticButton.value) {
    boundingRect.value = magneticButton.value.getBoundingClientRect()
  }
}

function handleMouseMove(e: MouseEvent) {
  if (magneticButton.value) {
    // needed, so that the button doesn't have a fucking seizure, if loaded from other page or other scroll position
    boundingRect.value = magneticButton.value.getBoundingClientRect()
    const rect = boundingRect.value

    const mousePosX = e.clientX - rect.left
    const mousePosY = e.clientY - rect.top

    gsap.to(magneticButton.value, {
      x: (mousePosX - rect.width / 2) * 0.4,
      y: (mousePosY - rect.height / 2) * 0.4,
      duration: 0.8,
      ease: 'power3.out',
    })
  }
}

function handleMouseLeave() {
  if (magneticButton.value) {
    gsap.to(magneticButton.value, {
      x: 0,
      y: 0,
      duration: 0.8,
      ease: 'elastic.out(1,0.3)',
    })
  }
}

useResizeObserver(magneticButton, updateBoundingRect)
useEventListener(window, 'resize', updateBoundingRect)
useEventListener(magneticButton, 'mousemove', handleMouseMove)
useEventListener(magneticButton, 'mouseleave', handleMouseLeave)

onMounted(() => {
  updateBoundingRect()
})
</script>

<template>
  <button ref="magneticButton">
    <template v-if="href">
      <NuxtLink class="cta-button" :to="href">
        {{ text }} <slot />
      </NuxtLink>
    </template>
    <template v-else>
      <div class="cta-button">
        {{ text }} <slot />
      </div>
    </template>
  </button>
</template>

<style>
.cta-button {
  font-weight: 900;
  font-size: 1.6rem;
  cursor: pointer;
  outline: none;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
