export default defineNuxtPlugin((nuxtApp) => {
  const { selectedAiChat } = useSelectedAiChat();
  const { user } = useUserSession();

  nuxtApp.hooks.hook('app:mounted', () => {
    const localStorageSelectedChatId = useLocalStorage(
      localStorageTopicKey(`${user.value?.id ?? -1}:selected-ai-chat-id`),
      -1
    );

    selectedAiChat.value.id = localStorageSelectedChatId.value; // initially set the selected chat, from local storage, on load
  })
});
