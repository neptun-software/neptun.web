<script setup lang="ts">
definePageMeta({
  name: 'Sign Up',
  alias: ['/register', '/signup'],
})

// defineOgImageComponent('NuxtSeo');
</script>

<template>
  <div
    class="flex justify-center px-2 pt-4 pb-24 my-2 min-h-screen max-h-full md:items-center md:pt-0"
  >
    <AuthenticationForm mode="signup" />
  </div>
</template>

<style scoped></style>
