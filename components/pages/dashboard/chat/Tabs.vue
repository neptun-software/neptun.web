<script lang="ts" setup>
const { getTabState, setTabState } = useUiStore()

const selectedDashboardTab = computed({
  get: () => getTabState('dashboard_chat').value || 'chat',
  set: (value) => {
    setTabState('dashboard_chat', value)
  },
})

onMounted(() => {
  if (!selectedDashboardTab.value) {
    selectedDashboardTab.value = 'chat'
  }
})
</script>

<template>
  <div>
    <ShadcnTabs
      v-model="selectedDashboardTab"
      default-value="chat"
      class="h-screen max-h-[calc(100%-3rem)] pr-2"
    >
      <ShadcnTabsList class="flex justify-start w-full bg-muted/50">
        <ShadcnTabsTrigger value="chats">
          All Chats
        </ShadcnTabsTrigger>
        <ShadcnTabsTrigger value="chat">
          Active Chat Information
        </ShadcnTabsTrigger>
      </ShadcnTabsList>
      <ShadcnTabsContent value="chats" class="h-full">
        <DashboardChats />
      </ShadcnTabsContent>
      <ShadcnTabsContent value="chat" class="h-full">
        <DashboardChatInformation />
        <!-- FILES OF CHAT -->
      </ShadcnTabsContent>
    </ShadcnTabs>
  </div>
</template>

<style scoped></style>
