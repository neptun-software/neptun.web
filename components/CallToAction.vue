<script setup lang="ts">
import { gsap } from 'gsap';

defineProps<{
  text: string;
}>();

const { x: scrollX, y: scrollY } = useWindowScroll(); // needed, so that the button doesn't have a fucking seizure, when you scroll
const magneticButton = ref<HTMLButtonElement | null>(null);
const boundingRect = ref<DOMRect | null>(null);

const updateBoundingRect = () => {
  if (magneticButton.value) {
    boundingRect.value = magneticButton.value.getBoundingClientRect();
  }
};

const handleMouseMove = (e: MouseEvent) => {
  if (boundingRect.value && magneticButton.value) {
    const rect = boundingRect.value;
    const mousePosX = e.clientX - rect.left + scrollX.value;
    const mousePosY = e.clientY - rect.top + scrollY.value;

    gsap.to(magneticButton.value, {
      x: (mousePosX - rect.width / 2) * 0.4,
      y: (mousePosY - rect.height / 2) * 0.4,
      duration: 0.8,
      ease: 'power3.out',
    });
  }
};

const handleMouseLeave = () => {
  if (magneticButton.value) {
    gsap.to(magneticButton.value, {
      x: 0,
      y: 0,
      duration: 0.8,
      ease: 'elastic.out(1,0.3)',
    });
  }
};

useResizeObserver(magneticButton, updateBoundingRect);
useEventListener(window, 'resize', updateBoundingRect);
useEventListener(magneticButton, 'mousemove', handleMouseMove);
useEventListener(magneticButton, 'mouseleave', handleMouseLeave);

onMounted(() => {
  updateBoundingRect();
});
</script>

<template>
  <button ref="magneticButton">
    <NuxtLink class="cta-button bg-slate-900 text-slate-200" to="/sign-in">
      {{ text }}
    </NuxtLink>
  </button>
</template>

<style>
.cta-button {
  font-weight: 900;
  font-size: 1.6rem;
  font-family: 'Syne', sans-serif;
  cursor: pointer;
  outline: none;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 12rem;
  height: 12rem;
  border-radius: 100%;
}
</style>
