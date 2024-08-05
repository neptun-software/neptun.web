<script setup lang="ts">
import type { NuxtError } from '#app';

defineProps({
  error: Object as () => NuxtError,
});

const handleError = () => clearError({ redirect: '/home' });
</script>

<template #error="{ error }">
  <NuxtLayout>
    <div class="flex flex-col items-center justify-center h-full bg-slate-950">
      <BubbleText :text="String(error?.statusCode ?? 500)">
        <h1 class="font-bold text-9xl">
          {{ error?.statusCode }}
        </h1>
      </BubbleText>

      <div class="z-10 flex flex-col justify-center pb-12">
        <p class="text-4xl font-medium text-slate-200">
          {{ error?.message }}
        </p>
        <ShadcnButton class="mt-4" variant="secondary" @click="handleError">
          Home
        </ShadcnButton>
      </div>
    </div>
  </NuxtLayout>
</template>
