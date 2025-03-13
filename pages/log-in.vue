<script setup lang="ts">
definePageMeta({
  name: 'Login',
  alias: ['/sign-in', '/login'],
})

// defineOgImageComponent('NuxtSeo');
</script>

<template>
  <div
    class="flex justify-center px-2 pt-4 pb-24 my-2 min-h-screen max-h-full md:items-center md:pt-0"
  >
    <AuthenticationForm mode="login" />
  </div>
</template>

<style scoped></style>
