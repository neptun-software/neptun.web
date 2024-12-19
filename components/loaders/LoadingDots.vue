<script lang="ts" setup>
const currentDot = ref(1)
let interval: NodeJS.Timeout

function updateDots() {
  currentDot.value = (currentDot.value % 3) + 1
}

onMounted(() => {
  interval = setInterval(updateDots, 300)
})

onUnmounted(() => {
  clearInterval(interval)
})
</script>

<template>
  <span class="ml-[0.125rem]">
    <span v-if="currentDot >= 1">.</span>
    <span v-if="currentDot >= 2">.</span>
    <span v-if="currentDot >= 3">.</span>
  </span>
</template>

<style scoped></style>
