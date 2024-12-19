<script setup lang="ts">
import { Icon } from '@iconify/vue'

const colorMode = useColorMode()
</script>

<template>
  <div>
    <ShadcnDropdownMenu>
      <ShadcnDropdownMenuTrigger as-child>
        <ShadcnButton variant="outline">
          <Icon
            icon="radix-icons:moon"
            class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
          />
          <Icon
            icon="radix-icons:sun"
            class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
          />
          <span class="sr-only">Toggle theme</span>
        </ShadcnButton>
      </ShadcnDropdownMenuTrigger>
      <ShadcnDropdownMenuContent align="end" class="flex flex-col gap-1">
        <ShadcnDropdownMenuItem
          class="cursor-pointer"
          :class="{
            'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground':
              colorMode.value === 'light',
          }"
          @click="colorMode.preference = 'light'"
        >
          Light
        </ShadcnDropdownMenuItem>
        <ShadcnDropdownMenuItem
          class="cursor-pointer"
          :class="{
            'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground':
              colorMode.value === 'dark',
          }"
          @click="colorMode.preference = 'dark'"
        >
          Dark
        </ShadcnDropdownMenuItem>
        <ShadcnDropdownMenuItem
          class="cursor-pointer"
          @click="colorMode.preference = 'system'"
        >
          System
        </ShadcnDropdownMenuItem>
      </ShadcnDropdownMenuContent>
    </ShadcnDropdownMenu>
  </div>
</template>

<style scoped></style>
