<script lang="ts" setup>
import { RefreshCcw } from 'lucide-vue-next'
import { templatesAliases } from '~/utils/pages'

definePageMeta({
  name: 'Templates',
  alias: templatesAliases,
})

const { isLoading } = useTemplates()
const { loggedIn } = useUserSession()
const { getTabState, setTabState } = useUiStore()

const paginatedTemplatesRef = ref<{ refresh: () => Promise<void> } | null>(null)
const infiniteTemplatesRef = ref<{ refresh: () => Promise<void> } | null>(null)

// Main tabs state
const mainTab = computed({
  get: () => getTabState('templates_main').value || 'templates',
  set: (value) => {
    setTabState('templates_main', value)
  },
})

// View type tabs state
const viewTypeTab = computed({
  get: () => getTabState('templates_view').value || 'paginated-pages',
  set: (value) => {
    setTabState('templates_view', value)
  },
})

async function refreshTemplates() {
  if (viewTypeTab.value === 'paginated-pages') {
    await paginatedTemplatesRef.value?.refresh()
  } else {
    await infiniteTemplatesRef.value?.refresh()
  }
}

watch(viewTypeTab, async (newValue) => {
  await nextTick()
  if (newValue === 'infinite-scroll') {
    await infiniteTemplatesRef.value?.refresh()
  } else {
    await paginatedTemplatesRef.value?.refresh()
  }
}, { immediate: true })

onMounted(async () => {
  await nextTick()
  await refreshTemplates()
})

// defineOgImageComponent('NuxtSeo');
</script>

<template>
  <div class="p-4">
    <ShadcnTabs v-model="mainTab" default-value="templates" class="w-full">
      <ShadcnTabsList class="flex flex-grow justify-start">
        <ShadcnTabsTrigger value="templates">
          Templates
        </ShadcnTabsTrigger>
        <ShadcnTabsTrigger v-if="loggedIn" value="manage">
          Manage
        </ShadcnTabsTrigger>
      </ShadcnTabsList>

      <ShadcnTabsContent value="templates" class="p-4 rounded-md border">
        <div class="space-y-4">
          <div class="flex gap-4 items-center">
            <ShadcnTabs v-model="viewTypeTab" :default-value="viewTypeTab" class="flex-1">
              <div class="flex gap-2 items-center">
                <ShadcnTabsList class="flex flex-grow justify-start">
                  <ShadcnTabsTrigger value="paginated-pages">
                    Paginated Pages
                  </ShadcnTabsTrigger>
                  <ShadcnTabsTrigger value="infinite-scroll">
                    Infinite Scroll
                  </ShadcnTabsTrigger>
                </ShadcnTabsList>

                <ShadcnButton
                  variant="outline"
                  size="icon"
                  :disabled="isLoading"
                  @click="refreshTemplates"
                >
                  <RefreshCcw class="size-4" />
                </ShadcnButton>
              </div>

              <div class="mt-4">
                <Suspense>
                  <template #default>
                    <PaginatedTemplates
                      v-if="viewTypeTab === 'paginated-pages'"
                      ref="paginatedTemplatesRef"
                    />
                    <InfiniteTemplates
                      v-else
                      ref="infiniteTemplatesRef"
                    />
                  </template>
                </Suspense>
              </div>
            </ShadcnTabs>
          </div>
        </div>
      </ShadcnTabsContent>

      <ShadcnTabsContent v-if="loggedIn" value="manage" class="p-4 rounded-md border">
        <CollectionTemplateListManager />
      </ShadcnTabsContent>
    </ShadcnTabs>
  </div>
</template>

<style scoped></style>
