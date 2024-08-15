<script lang="ts" setup>
import { Trash2 } from 'lucide-vue-next';

defineProps<{
  animationIsActive?: boolean;
}>();

const id = useId();
</script>

<template>
  <div :id="'trash-icon-' + id">
    <AnimatedIcon
      :animationLink="'/assets/icons/animated/Trash V2/trashV2.json'"
      :animationIsActive="animationIsActive"
    >
      <Trash2 class="w-4 h-4 ml-1" />
    </AnimatedIcon>
  </div>
</template>

<style scoped></style>
