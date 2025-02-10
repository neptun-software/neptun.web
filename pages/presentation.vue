<script setup lang="ts">
definePageMeta({
  layout: 'default',
  alias: ['/p', '/s', '/slides'],
})
</script>

<template>
  <div class="flex flex-col w-full h-screen">
    <iframe
      src="https://neptun-software.github.io/neptun.presentation/1"
      class="flex-1 w-full border-0"
      allow="fullscreen; fullscreen *"
      allowfullscreen
      mozallowfullscreen="true"
      webkitallowfullscreen="true"
      referrerpolicy="no-referrer"
    />
  </div>
</template>

<style scoped></style>
