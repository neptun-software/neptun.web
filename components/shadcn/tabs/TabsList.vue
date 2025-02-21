<script setup lang="ts">
import type { TabsListProps } from 'radix-vue'
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { useMutationObserver, useResizeObserver } from '@vueuse/core'
import { TabsList } from 'radix-vue'
import { computed, nextTick, ref } from 'vue'

const props = defineProps<TabsListProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props
  return delegated
})

const tabsListRef = ref<HTMLElement | null>(null)
const isInitialRender = ref(true)
const indicatorStyle = ref({
  left: '0px',
  top: '0px',
  width: '0px',
  height: '0px',
  opacity: '0',
})

async function updateIndicator() {
  if (!tabsListRef.value) {
    return
  }

  // Wait for next tick to ensure DOM updates are complete
  await nextTick()

  const activeTab = tabsListRef.value.querySelector<HTMLElement>('[data-state="active"]')
  if (!activeTab) {
    // Hide indicator if no active tab
    indicatorStyle.value.opacity = '0'
    return
  }

  // Show indicator
  indicatorStyle.value.opacity = '1'

  const activeRect = activeTab.getBoundingClientRect()
  const tabsRect = tabsListRef.value.getBoundingClientRect()

  requestAnimationFrame(() => {
    indicatorStyle.value = {
      left: `${activeRect.left - tabsRect.left}px`,
      top: `${activeRect.top - tabsRect.top}px`,
      width: `${activeRect.width}px`,
      height: `${activeRect.height}px`,
      opacity: '1',
    }
    // After initial render, enable transitions
    if (isInitialRender.value) {
      setTimeout(() => {
        isInitialRender.value = false
      }, 0)
    }
  })
}

useResizeObserver(tabsListRef, () => {
  updateIndicator()
})

// Watch for parent size changes (up to 2 levels up)
const parentRef = computed(() => tabsListRef.value?.parentElement || null)
const grandParentRef = computed(() => parentRef.value?.parentElement || null)

useResizeObserver(parentRef, () => {
  updateIndicator()
})

useResizeObserver(grandParentRef, () => {
  updateIndicator()
})

// Watch for attribute changes that affect the tabs
useMutationObserver(tabsListRef, (mutations) => {
  const shouldUpdate = mutations.some(mutation =>
    mutation.type === 'attributes'
    && (mutation.attributeName === 'data-state' || mutation.attributeName === 'class'),
  )
  if (shouldUpdate) {
    updateIndicator()
  }
}, {
  attributes: true,
  childList: true,
  subtree: true,
})

nextTick(() => {
  updateIndicator()
})
</script>

<template>
  <div ref="tabsListRef" class="relative">
    <!-- Background -->
    <div class="absolute inset-0 rounded-md bg-muted" />

    <!-- Indicator -->
    <div
      class="absolute rounded-md shadow-sm bg-background" :class="[
        { 'transition-all duration-300 ease-in-out': !isInitialRender },
      ]"
      :style="indicatorStyle"
    />

    <!-- Content -->
    <TabsList
      v-bind="delegatedProps"
      :class="cn(
        'relative inline-flex items-center justify-center rounded-md p-1 text-muted-foreground',
        props.class,
      )"
    >
      <slot />
    </TabsList>
  </div>
</template>
