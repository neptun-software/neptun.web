<script setup lang="ts">
import { Share, Import } from 'lucide-vue-next';

definePageMeta({
  name: 'Dashboard',
  middleware: ['protected'],
  alias: dashboardAliases,
});

const headerNavigationStore = useHeaderNavigationStore();
const { headerNavigationElement } = storeToRefs(headerNavigationStore);

const headerNavigationHeight = ref(0);
watch(headerNavigationElement, (newHeaderNavigationElement) => {
  const { height } = useElementSize(newHeaderNavigationElement); // needs access to lifecycle hooks (that is why it is not defined in the store or a composable)
  headerNavigationHeight.value = height.value;
});

// TODO: fix `[Vue warn]: Hydration node mismatch` on some ShadcnTooltip
</script>

<template>
  <div class="grid w-full pl-2">
    <div class="flex flex-col">
      <header
        class="sticky left-0 z-20 flex items-center justify-between gap-1 py-2 border-b bg-background"
        :style="{ top: headerNavigationHeight + 'px' }"
      >
        <div class="flex items-center gap-2">
          <h1 class="pl-4 text-xl font-semibold truncate">Chat</h1>
        </div>
        <div class="flex gap-2 pr-5">
          <ShadcnButton
            variant="outline"
            size="sm"
            class="ml-auto gap-1.5 text-sm truncate"
            disabled
          >
            <Import class="size-3.5" />
            <!-- Import Code Repository To Analyze -->
          </ShadcnButton>
          <ShadcnButton
            variant="outline"
            size="sm"
            class="ml-auto gap-1.5 text-sm truncate"
            disabled
          >
            <Share class="size-3.5" />
            <!-- Share -->
          </ShadcnButton>
        </div>
      </header>
      <Dashboard />
    </div>
  </div>
</template>

<style scoped></style>
