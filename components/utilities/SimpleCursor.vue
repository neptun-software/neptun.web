<script setup>
import { useMouse, useWindowScroll } from '@vueuse/core'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  targets: {
    type: Array,
    default: () => ['button', 'h2', '.cta-button'],
  },
  circleColor: String,
  circleColorHover: String,
  dotColor: String,
  dotColorHover: String,
  hoverSize: {
    type: Number,
    default: 3,
  },
})

const scale = ref(1)
const circlePosX = ref(0)
const circlePosY = ref(0)
const dotPosX = ref(0)
const dotPosY = ref(0)
const customCursorCircle = ref(null)
const customCursorDot = ref(null)

const { x, y } = useMouse()
const { x: scrollX, y: scrollY } = useWindowScroll()

const targetElements = ref([])
const isHovering = computed(() => {
  if (targetElements.value.length === 0) {
    return false
  }

  return targetElements.value.some((el) => {
    if (!el) {
      return false
    }
    const rect = el.getBoundingClientRect()
    return (
      x.value >= rect.left
      && x.value <= rect.right
      && y.value >= rect.top
      && y.value <= rect.bottom
    )
  })
})

const circleStyle = computed(() => ({
  borderColor: isHovering.value ? props.circleColorHover : props.circleColor,
  transform: `translate(${circlePosX.value}px, ${circlePosY.value}px) scale(${scale.value})`,
}))

const dotStyle = computed(() => ({
  backgroundColor: isHovering.value ? props.dotColorHover : props.dotColor,
  transform: `translate(${dotPosX.value}px, ${dotPosY.value}px)`,
}))

function updateCursorPosition() {
  const circle = customCursorCircle.value
  const dot = customCursorDot.value

  if (circle && dot && x.value != null && y.value != null) {
    circlePosX.value = x.value - circle.clientWidth / 2
    circlePosY.value = y.value - circle.clientHeight / 2
    dotPosX.value = x.value - dot.clientWidth / 2
    dotPosY.value = y.value - dot.clientHeight / 2

    // adjust for scroll offsets
    circlePosX.value -= scrollX.value
    circlePosY.value -= scrollY.value
    dotPosX.value -= scrollX.value
    dotPosY.value -= scrollY.value

    scale.value = isHovering.value ? props.hoverSize : 1
  }
}

function updateTargetElements() {
  targetElements.value = props.targets
    .map(selector => document.querySelector(selector))
    .filter(el => el)
}

onMounted(() => {
  updateTargetElements()
  window.addEventListener('mousemove', updateCursorPosition)
  watch([x, y], updateCursorPosition)
  watch(() => props.targets, updateTargetElements)
  document.documentElement.style.cursor = 'none'
})

onUnmounted(() => {
  window.removeEventListener('mousemove', updateCursorPosition)
})
</script>

<template>
  <div class="custom-cursor">
    <div
      ref="customCursorCircle"
      class="custom-cursor__circle"
      :style="circleStyle"
    />
    <div ref="customCursorDot" class="custom-cursor__dot" :style="dotStyle" />
  </div>
</template>

<style lang="scss" scoped>
.custom-cursor {
  cursor: none;
  pointer-events: none;
  position: fixed;
  z-index: 9999;
  mix-blend-mode: difference;
}

.custom-cursor__circle {
  position: fixed;
  cursor: none;
  top: 0;
  left: 0;
  width: 34px;
  height: 34px;
  border: 1px solid #2f2f2f;
  border-radius: 50%;
  transform: translate(-100%, -100%);
  transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}

.custom-cursor__dot {
  position: fixed;
  cursor: none;
  top: 1px;
  left: 1px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background-color: #2f2f2f;
  transform: translate(-100%, -100%);
  transition: transform 0.2s cubic-bezier(0.23, 1, 0.32, 1);
}
</style>
