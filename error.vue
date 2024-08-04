<script setup lang="ts">
import type { NuxtError } from '#app';

defineProps({
  error: Object as () => NuxtError,
});

const handleError = () => clearError({ redirect: '/home' });
</script>

<template #error="{ error }">
  <NuxtLayout>
    <div class="flex flex-col items-center justify-center h-full">
      <h1 class="font-bold text-9xl">
        {{ error?.statusCode }}
      </h1>
      <p class="text-4xl font-medium">
        {{ error?.message }}
      </p>
      <ShadcnButton class="mt-4" variant="secondary" @click="handleError">
        Home
      </ShadcnButton>
    </div>
  </NuxtLayout>
</template>
