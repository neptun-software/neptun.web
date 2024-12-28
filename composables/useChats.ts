import type { MinimalChat } from '~/lib/types/models/chat'
import {
  type AllowedAiModelPaths,
  type AllowedAiModels,
  defaultAiModelDomain,
} from '~/lib/types/models/ai'
// const { console } = useLogger();

function createChatName(time: Date) {
  return `chat-${time.valueOf()}`
}

export function useSelectedAiChat() {
  const aiChatReCreationTrigger = useState(
    'selected-ai-chat-is-recreated',
    () => ref<string>(crypto.randomUUID()),
  )
  const selectedAiChat = useState('selected-ai-chat', () =>
    reactive<MinimalChat>(selectedAiChatDefaults(new Date())))

  const selectedAiChatId = computed(() => {
    return selectedAiChat?.value?.id ?? -1
  })

  const selectedAiChatIsPlayground = computed(
    () => selectedAiChatId.value === -1,
  )

  const selectedAiChatApiPath = computed<AllowedAiModelPaths>(() => {
    return `/api/ai/huggingface/${selectedAiChat.value.model}/chat`
  })

  const selectedAiChatKey = computed(
    () =>
      `${selectedAiChatApiPath.value}?chat_id=${selectedAiChat.value.id}&isPlayground=${selectedAiChatIsPlayground.value}&isRecreated=${aiChatReCreationTrigger.value}`,
  )

  function selectedAiChatDefaults(
    time: Date,
    model: AllowedAiModels = defaultAiModelDomain,
  ) {
    return {
      id: -1,
      name: createChatName(time),
      model,
    } as MinimalChat
  }

  const resetSelectedAiChatToDefaults = (
    model: AllowedAiModels | undefined = undefined,
  ) => {
    selectedAiChat.value = selectedAiChatDefaults(
      new Date(),
      model ?? defaultAiModelDomain,
    )
    aiChatReCreationTrigger.value = crypto.randomUUID()
  }

  return {
    selectedAiChatKey,
    selectedAiChat,
    selectedAiChatId,
    selectedAiChatIsPlayground,
    selectedAiChatApiPath,
    resetSelectedAiChatToDefaults,
  }
}

export function useAiChatPlayground() {
  const aiPlaygroundChatName = useState('playground-ai-chat-name', () =>
    ref<string>())
  const aiPlaygroundChatMessages = useState('playground-ai-chat-messages', () =>
    reactive<any[]>([])) // Message is too complex...

  const { selectedAiChat, resetSelectedAiChatToDefaults } = useSelectedAiChat()
  if (selectedAiChat.value.id !== -1) {
    // set name, depending on selected chat
    aiPlaygroundChatName.value = createChatName(new Date())
  } else {
    aiPlaygroundChatName.value = selectedAiChat.value.name
  }

  function resetAiPlaygroundChat(
    model: AllowedAiModels = defaultAiModelDomain,
  ) {
    aiPlaygroundChatMessages.value = [] // setChatMessages([]); is done by rerendering the whole component which recreates the useChat composable with a new id
    resetSelectedAiChatToDefaults(model)
  }

  return {
    aiPlaygroundChatName,
    aiPlaygroundChatMessages,
    resetAiPlaygroundChat,
  }
}

export function useChatsSelectedForDeletion() {
  const chatsSelectedForDeletion = useState('chats-selected-for-deletion', () =>
    ref<number[]>([]))

  return chatsSelectedForDeletion
}

export function useChatsFilter() {
  // ?order_by=updated_at:desc,name:desc,model:desc
  const chatsFilter = useState('chats-filter', () => ref(''))
  return chatsFilter
}
