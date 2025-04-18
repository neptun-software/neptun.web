import type {
  AllowedAiModelPaths,
  AllowedAiModels,
  /* CloudflareModelPath,
  HuggingFaceModelPath,
  OllamaModelPath,
  OpenRouterModelPath, */
} from '~/lib/types/models/ai'
import type { MinimalChat } from '~/lib/types/models/chat'
import {
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
    const model = selectedAiChat.value.model
    const [publisher, modelName] = model.split('/')

    if (!publisher || !modelName) {
      throw new Error(`Invalid model format: ${model}. Expected format: publisher/model-name`)
    }

    return `/api/ai/${model}/chat` as AllowedAiModelPaths
    /* switch (publisher) {
      case 'cloudflare':
        return `/api/ai/cloudflare/${modelName}/chat` as CloudflareModelPath
      case 'openrouter':
        return `/api/ai/openrouter/${modelName}/chat` as OpenRouterModelPath
      case 'ollama':
        return `/api/ai/ollama/${modelName}/chat` as OllamaModelPath
      default:
        return `/api/ai/huggingface/${model}/chat` as HuggingFaceModelPath
    } */
  })

  const selectedAiChatKey = computed(
    () =>
      `${selectedAiChatApiPath.value}?chat_id=${selectedAiChat.value.id}&is_playground=${selectedAiChatIsPlayground.value}&isRecreated=${aiChatReCreationTrigger.value}`,
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
