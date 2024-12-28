<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { navigateTo } from '#imports'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const { loggedIn, user, clear } = useUserSession()
const { $headerNavigationElement } = useUiStore() // don't bind using :ref (VNodeRef and not Element)!!!

function handleSignOut(): (event: MouseEvent) => Promise<void> {
  return async (_event: MouseEvent) => {
    await clear()
    await navigateTo('/home')
  }
}
</script>

<template>
  <header
    ref="$headerNavigationElement"
    class="sticky top-0 left-0 z-40 border-b bg-background"
  >
    <nav
      class="flex items-center justify-between gap-2 px-4 py-4"
      :class="props.class"
    >
      <AppLinks layout="navigation" />
      <div class="flex items-center gap-2">
        <AsyncButton
          v-if="loggedIn"
          variant="outline"
          class="truncate"
          :on-click-async="handleSignOut()"
        >
          Sign Out
          <span class="hidden ml-1 lg:block">{{ user?.primary_email.substring(0, 15)
          }}{{
            user?.primary_email && user?.primary_email.length > 15
              ? '...'
              : ''
          }}
          </span>
        </AsyncButton>
        <ThemeToggle />
      </div>
    </nav>
  </header>
</template>

<style scoped>
header {
  padding: 0.25rem;
}
</style>
