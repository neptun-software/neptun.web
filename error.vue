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
        <h1
          class="font-bold text-[8rem] sm:text-[12rem] md:text-[14rem] lg:text-[18rem] xl:text-[20rem] 2xl:text-[24rem]"
        >
          {{ error?.statusCode }}
        </h1>
      </BubbleText>

      <div class="z-10 flex flex-col items-center pb-12 mx-2">
        <p class="text-4xl font-medium text-center text-slate-200">
          {{ error?.message }}
        </p>
        <ShadcnButton
          class="max-w-full mt-4 w-fit"
          variant="secondary"
          @click="handleError"
        >
          Home
        </ShadcnButton>
      </div>
    </div>
  </NuxtLayout>
</template>
