<script lang="ts" setup>
import { RefreshCcw } from 'lucide-vue-next'
import { templatesAliases } from '~/utils/pages'

definePageMeta({
  name: 'Templates',
  alias: templatesAliases,
})

const activeTab = ref('paginated-pages')
const { isLoading } = useTemplates()
const { loggedIn } = useUserSession()

const paginatedTemplatesRef = ref<{ refresh: () => Promise<void> } | null>(null)
const infiniteTemplatesRef = ref<{ refresh: () => Promise<void> } | null>(null)

async function refreshTemplates() {
  if (activeTab.value === 'paginated-pages') {
    await paginatedTemplatesRef.value?.refresh()
  } else {
    await infiniteTemplatesRef.value?.refresh()
  }
}

// defineOgImageComponent('NuxtSeo');
</script>

<template>
  <div class="p-4">
    <ShadcnTabs default-value="templates" class="w-full">
      <ShadcnTabsList class="flex justify-start flex-grow">
        <ShadcnTabsTrigger value="templates">
          Templates
        </ShadcnTabsTrigger>
        <ShadcnTabsTrigger v-if="loggedIn" value="manage">
          Manage
        </ShadcnTabsTrigger>
      </ShadcnTabsList>

      <ShadcnTabsContent value="templates" class="p-4 border rounded-md">
        <div class="space-y-4">
          <div class="flex items-center gap-4">
            <ShadcnTabs v-model="activeTab" default-value="paginated-pages" class="flex-1">
              <div class="flex items-center gap-2">
                <ShadcnTabsList class="flex justify-start flex-grow">
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

              <ShadcnTabsContent value="paginated-pages" class="p-4 border rounded-md">
                <PaginatedTemplates ref="paginatedTemplatesRef" />
              </ShadcnTabsContent>
              <ShadcnTabsContent value="infinite-scroll" class="p-4 border rounded-md">
                <InfiniteTemplates ref="infiniteTemplatesRef" />
              </ShadcnTabsContent>
            </ShadcnTabs>
          </div>
        </div>
      </ShadcnTabsContent>

      <ShadcnTabsContent v-if="loggedIn" value="manage" class="p-4 border rounded-md">
        <CollectionTemplateListManager />
      </ShadcnTabsContent>
    </ShadcnTabs>
  </div>
</template>

<style scoped></style>
