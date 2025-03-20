<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { Icon } from '@iconify/vue'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <footer :class="cn('flex z-10 flex-col border-t bg-background p-8 justify-center', props.class)">
    <AppLinks />

    <ShadcnSeparator class="mt-2 mb-1 bg-transparent" />

    <div class="flex flex-wrap gap-4 justify-center mt-4">
      <NuxtLink to="/imprint" active-class="text-primary" class="flex gap-2 items-center text-muted-foreground hover:text-foreground">
        <Icon icon="carbon:information" class="w-5 h-5" />
        <span>Imprint</span>
      </NuxtLink>
      <NuxtLink to="/privacy-policy" active-class="text-primary" class="flex gap-2 items-center text-muted-foreground hover:text-foreground">
        <Icon icon="carbon:security" class="w-5 h-5" />
        <span>Privacy Policy</span>
      </NuxtLink>
    </div>

    <div class="flex flex-wrap gap-4 justify-center mt-4">
      <NuxtLink to="https://github.com/neptun-software" target="_blank" class="flex gap-2 items-center text-muted-foreground hover:text-foreground">
        <Icon icon="ant-design:github-filled" class="w-5 h-5" />
        <span>GitHub</span>
      </NuxtLink>
      <NuxtLink to="https://huggingface.co/neptun-org" target="_blank" class="flex gap-2 items-center text-muted-foreground hover:text-foreground">
        <Icon icon="mingcute:ai-line" class="w-5 h-5" />
        <span>Huggingface</span>
      </NuxtLink>
      <NuxtLink to="https://pypi.org/project/neptun" target="_blank" class="flex gap-2 items-center text-muted-foreground hover:text-foreground">
        <Icon icon="akar-icons:python-fill" class="w-5 h-5" />
        <span>CLI-Tool</span>
      </NuxtLink>
      <NuxtLink to="https://github.com/apps/neptun-github-app" target="_blank" class="flex gap-2 items-center text-muted-foreground hover:text-foreground">
        <Icon icon="gg:data" class="w-5 h-5" />
        <span>GitHub App</span>
      </NuxtLink>
      <NuxtLink to="https://neptun-tools-docs.pages.dev" target="_blank" class="flex gap-2 items-center text-muted-foreground hover:text-foreground">
        <Icon icon="oui:documentation" class="w-5 h-5" />
        <span>Documentation</span>
      </NuxtLink>
    </div>

    <ShadcnSeparator class="mt-2 mb-1 bg-transparent" />

    <p class="mt-2 text-center text-muted-foreground">
      Animated Icons by
      <NuxtLink
        class="hover:underline"
        to="https://useanimations.com"
        target="_blank"
        external
      >
        useanimations
      </NuxtLink>
    </p>
  </footer>
</template>
