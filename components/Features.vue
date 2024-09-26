<script setup lang="ts">
import type { FunctionalComponent } from 'vue'
import { Book } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface FeaturesProps {
  icon: FunctionalComponent
  title: string
  description: string
}

const featureList: FeaturesProps[] = [
  {
    icon: Book,
    title: 'Focus on markdown',
    description:
      'Every code snipped generated can be compared to previous versions and exported easily, the most popular languages are highlighted and even you can write markdown, to communicate with the AI!'
  }
]
</script>

<template>
  <section
    id="features"
    class="container py-24 sm:py-32"
  >
    <h2 class="mb-2 text-lg tracking-wider text-center">
      Features
    </h2>

    <h2 class="mb-4 text-3xl font-bold text-center md:text-4xl">
      How?
    </h2>

    <h3 class="mx-auto mb-8 text-xl text-center md:w-1/2 text-muted-foreground">
      We try to make it as easy as possible for new developers, to get started
      with CICD using AI.
    </h3>

    <div class="flex justify-center gap-4">
      <div
        v-for="{ icon, title, description } in featureList"
        :key="title"
        class="max-w-full"
      >
        <Card
          class="h-full border-0 shadow-none bg-secondary w-fit max-w-[65ch]"
        >
          <CardHeader class="flex items-center justify-center">
            <div
              class="p-2 mb-4 rounded-full bg-primary/20 ring-8 ring-primary/10"
            >
              <component
                :is="icon"
                class="size-6 text-primary"
              />
            </div>

            <CardTitle>
              {{ title }}
            </CardTitle>
          </CardHeader>

          <CardContent class="text-center text-muted-foreground">
            {{ description }}
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
</template>

<style scoped></style>
