<script lang="ts" setup>
import { RefreshCcw } from 'lucide-vue-next';

defineProps<{
  animationIsActive?: boolean;
}>();

const id = useId();
</script>

<template>
  <div :id="'refresh-icon-' + id">
    <AnimatedIcon
      :animationLink="'/assets/icons/animated/Refresh/refresh.json'"
      :animationIsActive="animationIsActive"
    >
      <RefreshCcw class="w-4 h-4 ml-1" />
    </AnimatedIcon>
  </div>
</template>

<style scoped></style>
