<script setup lang="ts">
import { Import } from 'lucide-vue-next'

definePageMeta({
  name: 'Dashboard',
  middleware: ['protected'],
  alias: dashboardAliases,
})

const { $headerNavigationElement } = useUiStore()

const headerNavigationHeight = ref(0)
watch($headerNavigationElement, (new$headerNavigationElement) => {
  const { height } = useElementSize(new$headerNavigationElement) // needs access to lifecycle hooks (that is why it is not defined in the store or a composable)
  headerNavigationHeight.value = height.value
})

// TODO: fix `[Vue warn]: Hydration node mismatch` on some ShadcnTooltip
</script>

<template>
  <div class="grid w-full pl-2">
    <div class="flex flex-col">
      <header
        class="sticky left-0 z-20 flex items-center justify-between gap-1 py-2 pt-4 border-b bg-background"
        :style="{ top: `${headerNavigationHeight}px` }"
      >
        <div class="flex items-center gap-2">
          <h1 class="pl-4 text-xl font-semibold truncate">
            Chat
          </h1>
        </div>

        <!-- Import Code Repositories From Github To Analyze -->
        <NuxtLink
          class="flex gap-2 pr-5"
          target="_blank"
          :to="
            IS_DEV
              ? 'https://github.com/apps/neptun-github-app-dev'
              : 'https://github.com/apps/neptun-github-app'
          "
          :external="true"
        >
          <ShadcnButton
            variant="outline"
            size="sm"
            class="ml-auto gap-1.5 text-sm truncate"
          >
            Import Github Repository
            <Import class="size-4" />
          </ShadcnButton>
        </NuxtLink>
      </header>
      <Dashboard />
    </div>
  </div>
</template>

<style scoped></style>
