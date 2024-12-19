<script lang="ts" setup>
defineProps<{
  isFirst?: boolean
  isLast?: boolean
}>()
</script>

<template>
  <div
    class="relative flex flex-col items-center px-4 py-16 bg-background/50 sm:px-6 lg:px-8"
  >
    <svg
      v-if="!isFirst"
      viewBox="0 0 1440 58"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="absolute top-0 left-0 z-10 w-full fill-primary"
    >
      <path
        d="M-100 58C-100 58 218.416 36.3297 693.5 36.3297C1168.58 36.3297 1487 58 1487 58V-3.8147e-06H-100V58Z"
      />
    </svg>

    <section id="ui-content">
      <slot />
    </section>

    <svg
      v-if="!isLast"
      viewBox="0 0 1440 58"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="absolute bottom-0 right-0 z-10 w-full fill-primary"
    >
      <path
        transform="rotate(180) translate(-1440, -60)"
        d="M-100 58C-100 58 218.416 36.3297 693.5 36.3297C1168.58 36.3297 1487 58 1487 58V-3.8147e-06H-100V58Z"
      />
    </svg>
  </div>
</template>

<style scoped>
#ui-content {
  position: relative;
  margin-top: 1rem;
  margin-bottom: 1rem;
  width: 100%;
}
</style>
