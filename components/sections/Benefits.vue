<script setup lang="ts">
import type { FunctionalComponent } from 'vue'
import { Lightbulb, Timer } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/shadcn/card'

interface BenefitsProps {
  icon: FunctionalComponent
  title: string
  description: string
}

const benefitList: BenefitsProps[] = [
  {
    icon: Timer,
    title: 'More time for the actual project!',
    description:
      'The more time you spend on the actual project, the better. Am I right?',
  },
  {
    icon: Lightbulb,
    title: 'Easy entry!',
    description:
      'Neptun is a very good starting point, for you to learn how to dockerize your applications.',
  },
]
</script>

<template>
  <section id="benefits" class="py-24 sm:py-32">
    <div class="grid lg:grid-cols-2 place-items-center lg:gap-24">
      <div>
        <h2 class="text-lg tracking-wider">
          Benefits
        </h2>

        <h2 class="mb-4 text-3xl font-bold md:text-4xl">
          Why?
        </h2>
        <p class="mb-8 text-xl text-muted-foreground">
          Do you like reading documentations all day?<br>
          If so you are NOT in the right place.
        </p>
      </div>

      <!-- type: prop for simple/spotlight -->
      <div class="grid w-full gap-4 lg:grid-cols-2">
        <template
          v-for="({ icon, title, description }, index) in benefitList"
          :key="title"
        >
          <Card
            class="transition-all delay-75 bg-muted/50 dark:bg-card hover:bg-background dark:hover:bg-background group/number"
          >
            <CardHeader>
              <div class="flex items-center justify-between mb-4">
                <component :is="icon" class="size-8 text-primary" />

                <span
                  class="text-5xl font-medium transition-all delay-75 text-muted-foreground/15 group-hover/number:text-muted-foreground/30"
                >0{{ index + 1 }}</span>
              </div>

              <CardTitle>{{ title }}</CardTitle>
            </CardHeader>

            <CardContent class="text-muted-foreground">
              {{ description }}
            </CardContent>
          </Card>
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped></style>
