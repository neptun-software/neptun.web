<script setup lang="ts">
import type { TabsListProps } from 'radix-vue'
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { useMutationObserver, useResizeObserver, useTimeoutFn } from '@vueuse/core'
import { TabsList } from 'radix-vue'
import { computed, nextTick, onMounted, ref, watch } from 'vue'

const props = defineProps<TabsListProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props
  return delegated
})

const $tabsListElement = ref<HTMLElement | null>(null)
const isInitialRender = ref(true)
const indicatorStyle = ref({
  left: '0px',
  top: '0px',
  width: '0px',
  height: '0px',
  opacity: '0',
})

const { start: updateIndicatorDebounced } = useTimeoutFn(updateIndicator, 50)

async function updateIndicator() {
  if (!$tabsListElement.value) {
    return
  }

  // Wait for two animation frames to ensure all DOM updates and style calculations are complete
  await new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(async () => {
        await nextTick()

        const activeTab = $tabsListElement.value?.querySelector<HTMLElement>('[data-state="active"]')
        if (!activeTab) {
          indicatorStyle.value.opacity = '0'
          return
        }

        // Ensure the element is visible and has dimensions
        if (activeTab.offsetWidth === 0 || activeTab.offsetHeight === 0) {
          setTimeout(updateIndicatorDebounced, 50)
          return
        }

        indicatorStyle.value.opacity = '1'

        const activeRect = activeTab.getBoundingClientRect()
        const tabsRect = $tabsListElement.value!.getBoundingClientRect()

        indicatorStyle.value = {
          left: `${activeRect.left - tabsRect.left}px`,
          top: `${activeRect.top - tabsRect.top}px`,
          width: `${activeRect.width}px`,
          height: `${activeRect.height}px`,
          opacity: '1',
        }

        if (isInitialRender.value) {
          setTimeout(() => {
            isInitialRender.value = false
          }, 0)
        }
        resolve(null)
      })
    })
  })
}

// Watch for content changes that might affect sizing
useMutationObserver(
  $tabsListElement,
  () => {
    updateIndicatorDebounced()
  },
  {
    attributes: true,
    childList: true,
    subtree: true,
    characterData: true,
  },
)

onMounted(() => {
  if ($tabsListElement.value) {
    updateIndicator()
  }
})

// Watch for any changes to the active tab
watch(() => $tabsListElement.value?.querySelector('[data-state="active"]'), () => {
  updateIndicatorDebounced()
}, { deep: true })

useResizeObserver($tabsListElement, () => {
  updateIndicatorDebounced()
})

// Watch for parent size changes (up to 2 levels up)
const parentRef = computed(() => $tabsListElement.value?.parentElement || null)
const grandParentRef = computed(() => parentRef.value?.parentElement || null)

useResizeObserver(parentRef, () => {
  updateIndicatorDebounced()
})

useResizeObserver(grandParentRef, () => {
  updateIndicatorDebounced()
})
</script>

<template>
  <div ref="$tabsListElement" class="relative">
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
