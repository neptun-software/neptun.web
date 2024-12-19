export default defineNuxtPlugin(() => {
  const { selectedAiChat, selectedAiChatId } = useSelectedAiChat()
  const { user } = useUserSession()

  watch(selectedAiChatId, () => {
    const localStorageSelectedChatId = useLocalStorage(
      localStorageTopicKey(`${user.value?.id ?? -1}:selected-ai-chat-id`),
      -1,
    )

    localStorageSelectedChatId.value = selectedAiChat.value.id
  })
})
