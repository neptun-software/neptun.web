<script setup>
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// eslint-disable-next-line vue/require-prop-types
defineProps(['src', 'icon', 'title', 'description', 'index']);
</script>

<template>
  <div
    class="relative h-full bg-slate-800 rounded-3xl before:absolute before:w-80 before:h-80 before:-left-40 before:-top-40 before:bg-slate-400 before:rounded-full before:opacity-0 before:pointer-events-none before:transition-opacity before:duration-500 before:translate-x-[var(--mouse-x)] before:translate-y-[var(--mouse-y)] before:group-hover:opacity-100 before:z-10 before:blur-[100px] after:absolute after:w-96 after:h-96 after:-left-48 after:-top-48 after:bg-indigo-500 after:rounded-full after:opacity-0 after:pointer-events-none after:transition-opacity after:duration-500 after:translate-x-[var(--mouse-x)] after:translate-y-[var(--mouse-y)] after:hover:opacity-10 after:z-30 after:blur-[100px] overflow-hidden"
  >
    <div
      class="relative h-full bg-slate-900 rounded-[inherit] z-20 overflow-hidden"
    >
      <div
        class="absolute bottom-0 w-1/2 -translate-x-1/2 translate-y-1/2 pointer-events-none left-1/2 -z-10 aspect-square"
        aria-hidden="true"
      >
        <div
          class="absolute inset-0 translate-z-0 bg-slate-800 rounded-full blur-[80px]"
        />
      </div>

      <Card
        class="transition-all delay-75 bg-transparent border-transparent group/number"
      >
        <div
          class="w-[40%] h-[40%] absolute inset-0 m-auto -translate-y-[10%] blur-3xl -z-10 rounded-full bg-indigo-600"
          aria-hidden="true"
        />

        <CardHeader>
          <div class="flex items-center justify-between mb-4">
            <NuxtImg
              v-if="src"
              class="inline-flex size-8"
              :src="src"
              width="200"
              height="200"
              :alt="title"
            />
            <component
              :is="icon"
              v-else
              class="text-white size-10"
            />

            <span
              class="text-5xl font-medium transition-all delay-75 text-muted-foreground/15 group-hover/number:text-muted-foreground/30"
            >0{{ index + 1 }}</span>
          </div>

          <CardTitle class="text-white">
            {{ title }}
          </CardTitle>
        </CardHeader>

        <CardContent class="text-muted-foreground">
          {{ description }}
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<style scoped></style>
