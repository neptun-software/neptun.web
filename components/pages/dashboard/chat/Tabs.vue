<script lang="ts" setup>
const { user } = useUserSession()

type possibleDashboardTabs = 'chat' | 'chats'
const selectedDashboardTab = ref<any>('chat')
const selectedDashboardTabFromLocalStorage
  = useLocalStorage<possibleDashboardTabs>(
    localStorageTopicKey(`${user.value?.id ?? -1}:selected-dashboard-tab`),
    'chat',
  )

watch(selectedDashboardTab, () => {
  if (selectedDashboardTab.value === 'chat' || selectedDashboardTab.value === 'chats') {
    selectedDashboardTabFromLocalStorage.value = selectedDashboardTab.value
  }
})

onMounted(() => {
  if (selectedDashboardTabFromLocalStorage.value === 'chat' || selectedDashboardTabFromLocalStorage.value === 'chats') {
    selectedDashboardTab.value = selectedDashboardTabFromLocalStorage.value
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
