<script lang="ts" setup>
import { Trash2 } from 'lucide-vue-next'

defineProps<{
  animationIsActive?: boolean
}>()

const id = useId()
</script>

<template>
  <div :id="`trash-icon-${id}`">
    <AnimatedIcon
      animation-link="/assets/icons/animated/Trash V2/trashV2.json"
      :animation-is-active="animationIsActive"
    >
      <Trash2 class="w-4 h-4 ml-1" />
    </AnimatedIcon>
  </div>
</template>

<style scoped></style>
