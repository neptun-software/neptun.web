export default defineNuxtPlugin(() => {
  const { selectedAiChat, selectedAiChatId } = useSelectedAiChat()
  const { user } = useUserSession()

  // Watch for changes to either ID or model
  watch([selectedAiChatId, () => selectedAiChat.value.model], () => {
    const localStorageSelectedChatId = useLocalStorage(
      localStorageTopicKey(`${user.value?.id ?? -1}:selected-ai-chat-id`),
      -1,
    )
    const localStorageSelectedChatModel = useLocalStorage(
      localStorageTopicKey(`${user.value?.id ?? -1}:selected-ai-chat-model`),
      selectedAiChat.value.model,
    )

    // Update both ID and model in localStorage
    localStorageSelectedChatId.value = selectedAiChat.value.id
    localStorageSelectedChatModel.value = selectedAiChat.value.model
  })
})
