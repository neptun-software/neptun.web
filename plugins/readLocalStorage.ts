import type { AllowedAiModels } from '~/lib/types/models/ai'

export default defineNuxtPlugin((nuxtApp) => {
  const { selectedAiChat } = useSelectedAiChat()
  const { user } = useUserSession()

  nuxtApp.hooks.hook('app:mounted', () => {
    const localStorageSelectedChatId = useLocalStorage(
      localStorageTopicKey(`${user.value?.id ?? -1}:selected-ai-chat-id`),
      -1,
    )
    const localStorageSelectedChatModel = useLocalStorage(
      localStorageTopicKey(`${user.value?.id ?? -1}:selected-ai-chat-model`),
      selectedAiChat.value.model,
    )

    // Initially set both the ID and model from local storage
    selectedAiChat.value.id = localStorageSelectedChatId.value
    selectedAiChat.value.model = localStorageSelectedChatModel.value as AllowedAiModels
  })
})
