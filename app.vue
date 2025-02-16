<script setup lang="ts">
import { ConfigProvider } from 'radix-vue'

const router = useRouter()
const currentRouteName = computed(() => router.currentRoute.value.name)
</script>

<template>
  <div>
    <!-- <ConfigProvider :use-id="useSsrSaveId">
      <ShadcnToaster close-button />
      <NuxtLoadingIndicator
        color="hsl(var(--primary) / 0.9)"
        error-color="hsl(var(--destructive))"
        :height="3"
        :duration="2000"
        :throttle="200"
      />
      <DynamicMeta :key="currentRouteName" />
      <div>
        <NuxtRouteAnnouncer />
        <NuxtLayout> Hello, World! </NuxtLayout>
      </div>
    </ConfigProvider> -->

    <!--
    Loading Indicator: https://github.com/nuxt/nuxt/issues/18630, https://nuxt.com/docs/api/composables/use-loading-indicator
    DynamicMeta: key is needed, so that the component is rerendered without a prop change
    div: needed for transitions to work properly
    -->

    <ConfigProvider :use-id="useSsrSaveId">
      <ShadcnToaster
        close-button
        position="top-center"
        offset="1.5rem"
      />
      <NuxtLoadingIndicator
        color="hsl(var(--primary) / 0.9)"
        error-color="hsl(var(--destructive))"
        :height="3"
        :duration="2000"
        :throttle="200"
      />
      <DynamicMeta :key="currentRouteName" />
      <div>
        <NuxtRouteAnnouncer />
        <NuxtLayout>
          <NuxtPage />
        </NuxtLayout>
      </div>
    </ConfigProvider>
  </div>
</template>

<style>
/* TRANSITIONS */
.page-enter-active,
.page-leave-active {
  transition: all 0.1s;
}

.page-enter-from {
  opacity: 0;
  transform: translate(-50px, 0);
}

.page-leave-to {
  opacity: 0;
  transform: translate(50px, 0);
}

.layout-enter-active,
.layout-leave-active {
  transition: all 0.1s;
}

.layout-enter-from,
.layout-leave-to {
  opacity: 0;
}
</style>
