<script setup lang="ts">
definePageMeta({
  name: 'Login',
  alias: ['/sign-in', '/login'],
});

// defineOgImageComponent('NuxtSeo');
</script>

<template>
  <div
    class="flex items-center justify-center h-screen max-h-full px-2 pb-24 my-2"
  >
    <LogIn />
  </div>
</template>

<style scoped></style>
