<script setup lang="ts">
definePageMeta({
  name: 'Login',
  alias: ['/sign-in', '/login'],
})

// defineOgImageComponent('NuxtSeo');
</script>

<template>
  <div
    class="flex justify-center max-h-full min-h-screen px-2 pt-4 pb-24 my-2 md:items-center md:pt-0"
  >
    <LogIn />
  </div>
</template>

<style scoped></style>
