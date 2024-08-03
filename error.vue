<script setup lang="ts">
import type { NuxtError } from '#app';

defineProps({
  error: Object as () => NuxtError,
});

const handleError = () => clearError({ redirect: '/home' });
</script>

<template #error="{ error }">
  <NuxtLayout>
    <h1 class="font-bold text-9xl text-primary-foreground">
      {{ error?.statusCode }}
    </h1>
    <p class="text-4xl font-medium text-primary-foreground">
      {{ error?.message }}
    </p>
    <ShadcnButton class="mt-4" variant="secondary" @click="handleError">
      Home
    </ShadcnButton>
  </NuxtLayout>
</template>
