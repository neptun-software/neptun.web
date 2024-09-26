import type { MinimalChat } from '~/lib/types/chat';
import {
  defaultAiModelDomain,
  type AllowedAiModelPaths,
  type AllowedAiModels
} from '~/lib/types/ai.models';
import { generateUUID } from '~/lib/utils';
// const { console } = useLogger();

function createChatName(time: Date) {
  return `chat-${time.valueOf()}`;
}

export const useSelectedAiChat = () => {
  const aiChatReCreationTrigger = useState(
    'selected-ai-chat-is-recreated',
    () => ref<string>(generateUUID())
  );
  const selectedAiChat = useState('selected-ai-chat', () =>
    reactive<MinimalChat>(selectedAiChatDefaults(new Date()))
  );

  const selectedAiChatApiPath = computed<AllowedAiModelPaths>(() => {
    return `/api/ai/huggingface/${selectedAiChat.value.model}/chat`;
  })
  const selectedAiChatIsPlayground = computed(
    () => selectedAiChatId.value === -1
  );
  const selectedAiChatId = computed(() => {
    return selectedAiChat?.value?.id ?? -1;
  })
  const selectedAiChatKey = computed(
    () =>
      `${selectedAiChatApiPath.value}?chat_id=${selectedAiChat.value.id}&isPlayground=${selectedAiChatIsPlayground.value}&isRecreated=${aiChatReCreationTrigger.value}`
  );

  function selectedAiChatDefaults(
    time: Date,
    model: AllowedAiModels = defaultAiModelDomain
  ) {
    return {
      id: -1,
      name: createChatName(time),
      model
    } as MinimalChat;
  }

  const resetSelectedAiChatToDefaults = (
    model: AllowedAiModels | undefined = undefined
  ) => {
    selectedAiChat.value = selectedAiChatDefaults(
      new Date(),
      model ?? defaultAiModelDomain
    );
    aiChatReCreationTrigger.value = generateUUID();
  }

  return {
    selectedAiChatKey,
    selectedAiChat,
    selectedAiChatId,
    selectedAiChatIsPlayground,
    selectedAiChatApiPath,
    resetSelectedAiChatToDefaults
  }
}

export const useAiChatPlayground = () => {
  const aiPlaygroundChatName = useState('playground-ai-chat-name', () =>
    ref<string>()
  );
  const aiPlaygroundChatMessages = useState('playground-ai-chat-messages', () =>
    reactive<any[]>([])
  ); // Message is too complex...

  const { selectedAiChat, resetSelectedAiChatToDefaults } = useSelectedAiChat();
  if (selectedAiChat.value.id !== -1) {
    // set name, depending on selected chat
    aiPlaygroundChatName.value = createChatName(new Date());
  }
  else {
    aiPlaygroundChatName.value = selectedAiChat.value.name;
  }

  function resetAiPlaygroundChat(
    model: AllowedAiModels = defaultAiModelDomain
  ) {
    aiPlaygroundChatMessages.value = []; // setChatMessages([]); is done by rerendering the whole component which recreates the useChat composable with a new id
    resetSelectedAiChatToDefaults(model);
  }

  return {
    aiPlaygroundChatName,
    aiPlaygroundChatMessages,
    resetAiPlaygroundChat
  }
}

export const useChatsSelectedForDeletion = () => {
  const chatsSelectedForDeletion = useState('chats-selected-for-deletion', () =>
    ref<number[]>([])
  );

  return chatsSelectedForDeletion;
}
