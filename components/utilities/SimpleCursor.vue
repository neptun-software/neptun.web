<script setup>
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
const isVisible = ref(false)

const { x, y } = useMouse({ type: 'client' })
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
  transform: `translate3d(${circlePosX.value}px, ${circlePosY.value}px, 0) scale(${scale.value})`,
  opacity: isVisible.value ? 1 : 0,
}))

const dotStyle = computed(() => ({
  backgroundColor: isHovering.value ? props.dotColorHover : props.dotColor,
  transform: `translate3d(${dotPosX.value}px, ${dotPosY.value}px, 0)`,
  opacity: isVisible.value ? 1 : 0,
}))

function updateCursorPosition() {
  const circle = customCursorCircle.value
  const dot = customCursorDot.value

  if (!circle || !dot || x.value == null || y.value == null) {
    return
  }

  const baseCircleX = x.value - circle.clientWidth / 2
  const baseCircleY = y.value - circle.clientHeight / 2
  const baseDotX = x.value - dot.clientWidth / 2
  const baseDotY = y.value - dot.clientHeight / 2

  requestAnimationFrame(() => {
    circlePosX.value = baseCircleX
    circlePosY.value = baseCircleY
    dotPosX.value = baseDotX
    dotPosY.value = baseDotY
    scale.value = isHovering.value ? props.hoverSize : 1
  })
}

const updateCursorPositionDebounced = useDebounceFn(updateCursorPosition, 5)

function updateTargetElements() {
  targetElements.value = props.targets
    .map(selector => document.querySelector(selector))
    .filter(el => el)
}

onMounted(() => {
  updateTargetElements()

  setTimeout(() => {
    isVisible.value = true
  }, 100)

  useEventListener(window, 'mousemove', updateCursorPosition, { passive: true })

  watch([scrollX, scrollY], () => {
    updateCursorPositionDebounced()
  })

  watch([x, y], () => {
    updateCursorPosition()
  }, { immediate: true })

  watch(() => props.targets, updateTargetElements)

  document.documentElement.style.cursor = 'none'
})

onUnmounted(() => {
  document.documentElement.style.cursor = ''
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
  will-change: transform;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
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
  opacity: 0;
  transform: translate3d(-100%, -100%, 0);
  transition:
    transform 0.15s cubic-bezier(0.23, 1, 0.32, 1),
    border-color 0.3s ease,
    opacity 0.3s ease;
  will-change: transform, opacity;
  backface-visibility: hidden;
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
  opacity: 0;
  transform: translate3d(-100%, -100%, 0);
  transition:
    transform 0.1s cubic-bezier(0.23, 1, 0.32, 1),
    background-color 0.3s ease,
    opacity 0.3s ease;
  will-change: transform, opacity;
  backface-visibility: hidden;
}
</style>
