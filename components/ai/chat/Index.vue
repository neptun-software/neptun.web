<script setup lang="ts">
import type { Message } from '~/lib/types/chat'
import { useChat } from '@ai-sdk/vue' // NOTE: can only be called in setup scripts ("Could not get current instance, check to make sure that `useSwrv` is declared in the top level of the setup function.")
import { Icon } from '@iconify/vue'
import {
  CornerDownLeft,
  Delete,
  Download,
  Link,
  MessageCircleReply,
  Mic,
  Mouse,
  Paperclip,
  RefreshCcw,
  Settings2,
  Trash2,
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { AllowedAiModelsEnum } from '~/lib/types/ai.models'
import { generateUUID } from '~/lib/utils'

const { console } = useLogger()
const isLoading = ref(true)

const { loadFiles } = useFetchFiles()
const { user } = useUserSession()
const {
  aiPlaygroundChatMessages: currentAiChatPlaygroundMessagesBackup,
  resetAiPlaygroundChat,
} = useAiChatPlayground()
const { generateMarkdownFromUrl } = useAPI()

/* CHAT AI */
const { selectedAiChat, selectedAiChatIsPlayground, selectedAiChatKey }
  = useSelectedAiChat()
const {
  messages: chatMessages,
  input: currentChatMessage,
  error: chatError,
  handleSubmit: handleChatMessageSubmit,
  reload: reloadLastChatMessage,
  isLoading: chatResponseIsLoading,
  setMessages: setChatMessages,
  /* append: appendChatMessage, */
} = useChat({
  id: String(selectedAiChat.value.id),
  api: selectedAiChatKey.value,
  keepLastMessageOnError: true,
})

const autoScrollEnabled = ref(true)

watch(chatError, () => {
  if (chatError.value) {
    toast.error(`Chat error!`)
  }
})

// INFO: Listening to chatMessages would be way more inefficient, since that would cause the callback function to be called on every token, the AI answers.
function waitForValidRef(condition: Ref<boolean | undefined>) {
  let unwatch: (() => void) | null = null

  const promise = new Promise<void>((resolve, reject) => {
    try {
      unwatch = watch(
        condition,
        (newValue) => {
          if (!newValue) {
            console.info(`Resolved value ${newValue}...`)
            resolve()
          }
        },
        { immediate: true },
      )
    } catch (error) {
      console.info('Failed to resolve value!')
      reject(error)
    }
  })

  promise.finally(() => {
    if (unwatch) {
      console.info('Removing watcher...')
      unwatch()
    }
  })

  return promise
}

const chatMessagesKey = ref<string>(generateUUID())
watch(
  () => chatMessages.value.length,
  async () => {
    const aiIsDoneResponding = waitForValidRef(chatResponseIsLoading)

    if (
      chatMessages.value[chatMessages.value.length - 1]?.role === 'assistant'
      && !isLoading.value // !isLoading.value needed, so that it only shows the toast, if the messages are actually new, and not onMounted (onLoaded)
    ) {
      toast.promise(aiIsDoneResponding, {
        loading: 'Fetching AI response...',
        success: (_data: any) => 'AI response fetched!',
        error: (_data: any) => 'Failed to fetch AI response!',
      })
    }

    await aiIsDoneResponding
    chatMessagesKey.value = generateUUID()
    if (selectedAiChat.value.id !== -1) {
      await loadFiles(user.value?.id ?? -1, selectedAiChat.value.id)
    }

    // Sanitize Llama3 messages (cannot be done in backend)
    if (selectedAiChat.value.model === AllowedAiModelsEnum.metaLlama) {
      chatMessages.value = chatMessages.value.map(message => ({
        ...message,
        content: getSanitizedMessageContent(message.content),
      }))
    }

    console.info('Setting chat history messages backup...')
    if (selectedAiChatIsPlayground.value && chatMessages.value.length > 0) {
      currentAiChatPlaygroundMessagesBackup.value = chatMessages.value
    }

    scrollToBottom()
  },
)

/* SPEECH RECOGNITION */
const {
  isSupported: isSpeechRecognitionSupported,
  isListening: isListeningToSpeech,
  result: speechRecognitionResult,
  start: startSpeechRecognition,
  stop: stopSpeechRecognition,
  error: speechRecognitionError,
} = useSpeechRecognition({
  lang: 'en-US',
  interimResults: true,
  continuous: true,
})

watch(speechRecognitionError, async () => {
  if (speechRecognitionError.value?.error === 'not-allowed') {
    toast.error(
      'Speech recognition was disabled for this page!\nPlease allow it, to use the feature!',
    )
  } else {
    toast.error(
      `Speech recognition error! (${speechRecognitionError.value?.error})`,
    )
  }
})

if (isSpeechRecognitionSupported.value && IS_CLIENT) {
  watch(speechRecognitionResult, () => {
    currentChatMessage.value = speechRecognitionResult.value
  })
}

/* CONVERT HTML TO MARKDOWN */
const urlToFetchHtmlFrom = ref('')

/* FILE UPLOAD */
const {
  /* files: uploadedFiles,  */ open: openFile,
  reset: resetFile,
  onChange,
} = useFileDialog({
  accept: 'text/plain',
  /* directory: true, */ // TODO: allow importing of file structure
})

onChange(async (uploadedFiles) => {
  if (uploadedFiles) {
    for (const file of uploadedFiles) {
      if (file.type !== 'text/plain') {
        toast.error('File type not supported!')
        resetFile()
        return
      }
      appendFileUploadToInput(file.type, file.name, await file.text())
    }

    resetFile()
  }
})

function appendFileUploadToInput(type: string, name: string, text: string) {
  console.info('Appending file upload to input...')

  const prettierFileContent = `\`\`\`${type}:${name}\n${text}\n\`\`\``
  currentChatMessage.value = prettierFileContent + currentChatMessage.value
}

// Load data
async function loadChatMessages(user_id: number, chat_id: number) {
  if (user_id !== -1) {
    if (chat_id === -1) {
      // load playground, if no chat is selected
      chatMessages.value = currentAiChatPlaygroundMessagesBackup.value
      return
    }

    try {
      const data = await $fetch(
        `/api/users/${user_id}/chats/${chat_id}/messages`,
      )

      if (data?.chatMessages && data.chatMessages.length > 0) {
        const chatMessages = data.chatMessages
        const messages = chatMessages.map(
          ({ id, message, actor }) =>
            ({
              id: `${String(id)}-${String(Date.now())}`,
              content: message,
              role: actor,
            } as Message),
        )

        setChatMessages(messages)
      }
    } catch {
      console.error('Failed to load chat messages!')
    }
  }
}

const globalChatMessage = useState('global-chat-message', () => '')

const {
  history: currentChatMessageHistory,
  commit: currentChatMessageCommit,
  // undo: currentChatMessageUndo,
  // redo: currentChatMessageRedo,
  // clear: currentChatMessageHistoryClear,
} = useManualRefHistory(globalChatMessage, {
  capacity: 3,
})

onMounted(async () => {
  await loadChatMessages(user.value?.id ?? -1, selectedAiChat.value.id).then(
    () => {
      isLoading.value = false
      // currentChatMessageHistoryClear();
    },
  )
})

// scroll to bottom
const $scrollArea = ref()
const $actualScrollArea = ref<HTMLElement | null>(null)
onMounted(() => {
  $actualScrollArea.value = $scrollArea.value.$el.querySelector(
    '[data-radix-scroll-area-viewport]',
  ) as HTMLElement
})

function scrollToBottom() {
  if ($actualScrollArea.value) {
    $actualScrollArea.value.scrollTo({
      top: $actualScrollArea.value.scrollHeight,
      behavior: 'smooth',
    })
  }
}

// TODO: find a actual solution for this
watchOnce(isLoading, () => {
  setTimeout(() => {
    if ($actualScrollArea.value) {
      scrollToBottom()
    }
  }, 500)
})

async function generateMarkdown() {
  const updatedCurrentChatMessage = await generateMarkdownFromUrl(
    urlToFetchHtmlFrom.value,
    currentChatMessage.value,
  )

  if (updatedCurrentChatMessage) {
    currentChatMessage.value = updatedCurrentChatMessage
  }
}

// Send Message on CTRL + ENTER && allow message history
let historyIndex = -1
function handleInputFieldKeyboardEvents(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    submitMessage()
  }

  if ((event.ctrlKey || event.metaKey) && event.key === 'ArrowUp') {
    if (historyIndex < currentChatMessageHistory.value.length - 1) {
      historyIndex++
      currentChatMessage.value = currentChatMessageHistory.value[historyIndex].snapshot
    }
  }

  if ((event.ctrlKey || event.metaKey) && event.key === 'ArrowDown') {
    if (historyIndex > 0) {
      historyIndex--
      currentChatMessage.value = currentChatMessageHistory.value[historyIndex].snapshot
    } else if (historyIndex === 0) {
      currentChatMessage.value = ''
      historyIndex = -1
    }
  }
}

function submitMessage() {
  if (currentChatMessage.value.trim() === '') {
    return
  }
  globalChatMessage.value = currentChatMessage.value
  currentChatMessageCommit()
  handleChatMessageSubmit()
}

async function reloadLast() {
  await deleteLast()
    .then(async () => {
      await reloadLastChatMessage()
        .then(() => {
          toast.success('Chat message reloaded!')
        })
        .catch(() => {
          toast.error('Failed to reload chat message!')
        })
    })
    .catch(() => {
      toast.error('Failed to reload chat message!')
    })
}

async function deleteLast() {
  await $fetch(
    `/api/users/${user.value?.id ?? -1}/chats/${
      selectedAiChat.value.id
    }/messages/last`,
    {
      method: 'DELETE',
    },
  )
    .then(async () => {
      toast.success('Chat message deleted!')
    })
    .catch(() => {
      toast.error('Failed to delete chat message!')
    })
}

async function downloadChatMessages(_event = null) {
  await downloadAsFile(chatMessages.value, 'chat-messages')
}

const messagesWithStreaming = computed(() => {
  return chatMessages.value.map((message) => {
    const sanitizedContent = getSanitizedMessageContent(message.content)
    
    if (message.role === 'assistant' 
        && message === chatMessages.value[chatMessages.value.length - 1]) {
      return {
        ...message,
        content: sanitizedContent,
        isStreaming: chatResponseIsLoading.value,
      }
    }
    return {
      ...message,
      content: sanitizedContent
    }
  })
})

watch(
  [
    () => chatMessages.value.length,
    chatResponseIsLoading,
    () => messagesWithStreaming.value[messagesWithStreaming.value.length - 1]?.content,
  ],
  () => {
    if (autoScrollEnabled.value) {
      scrollToBottom()
    }
  },
  { immediate: true },
)
</script>

<template>
  <div
    class="relative flex flex-col h-full min-h-[60vh] max-h-[75vh] rounded-xl bg-muted/50 p-4 order-1 2xl:order-2"
  >
    <div class="absolute z-10 left-3 top-3">
      <div class="flex gap-1">
        <ShadcnDrawer>
          <ShadcnDrawerTrigger as-child>
            <ShadcnButton variant="ghost" size="icon" class="lg:hidden">
              <Settings2 class="size-6" />
              <span class="sr-only">Settings</span>
            </ShadcnButton>
          </ShadcnDrawerTrigger>
          <ShadcnDrawerContent class="max-h-[90vh] p-2">
            <ShadcnDrawerHeader>
              <ShadcnDrawerTitle>Model Configuration</ShadcnDrawerTitle>
              <ShadcnDrawerDescription>
                Configure the settings for the model.
              </ShadcnDrawerDescription>
            </ShadcnDrawerHeader>
            <AiChatModelConfiguration />
          </ShadcnDrawerContent>
        </ShadcnDrawer>
        <ShadcnDialog>
          <ShadcnDialogTrigger as-child>
            <ShadcnButton variant="ghost" size="icon" class="lg:hidden">
              <MessageCircleReply class="size-6" />
              <span class="sr-only">Chats</span>
            </ShadcnButton>
          </ShadcnDialogTrigger>
          <ShadcnDialogContent>
            <ShadcnScrollArea class="relative max-h-[70vh]">
              <AiChats />
              <ShadcnSeparator class="my-1 bg-transparent" />
            </ShadcnScrollArea>
          </ShadcnDialogContent>
        </ShadcnDialog>

        <AsyncButton
          size="icon"
          variant="ghost"
          :hide-loader="false"
          :is-disabled="chatMessages.length === 0"
          :on-click-async="() => downloadChatMessages()"
        >
          <Download class="size-6" />
          <span class="sr-only">Download Chat</span>
        </AsyncButton>

        <AiChatShareDialog />
        <ShadcnButton
          size="icon"
          variant="ghost"
          :disabled="chatMessages.length === 0 || chatResponseIsLoading"
          @click="scrollToBottom"
        >
          <Mouse class="size-6" />
          <span class="sr-only">Scroll to bottom</span>
        </ShadcnButton>
        <ShadcnToggle
          :pressed="autoScrollEnabled"
          class="px-2"
          @update:pressed="autoScrollEnabled = $event"
        >
          <Icon icon="mdi:automatic" class="size-6" />
          <span class="sr-only">
            {{ autoScrollEnabled ? 'Disable' : 'Enable' }} auto-scroll
          </span>
        </ShadcnToggle>
      </div>
    </div>

    <ShadcnBadge
      variant="outline"
      class="absolute z-10 right-3 top-3 bg-background"
    >
      {{ selectedAiChat.name }}
    </ShadcnBadge>

    <div class="flex flex-col flex-grow max-w-full min-h-0 pt-10 pb-6">
      <ShadcnScrollArea ref="$scrollArea">
        <AiChatMessages :key="chatMessagesKey" :messages="messagesWithStreaming" />

        <template v-if="isLoading">
          <MessagesSkeleton />
        </template>

        <!-- User Input Draft -->
        <div
          v-if="currentChatMessage.trim() !== ''"
          class="flex justify-end mt-8"
        >
          <div
            class="break-words whitespace-pre-wrap max-w-[80%] border border-orange-300 rounded-lg bg-background px-4 py-2"
          >
            {{ currentChatMessage }}
          </div>
        </div>

        <InfoBlock show-loader show-dots :is-visible="chatResponseIsLoading">
          Waiting for response
        </InfoBlock>

        <div
          v-if="chatError"
          class="flex flex-wrap items-center w-full p-4 mt-8 font-black uppercase border-2 rounded-md text-ellipsis border-destructive"
        >
          <p class="flex-grow">
            Something went wrong!
          </p>

          <AsyncButton variant="outline" :on-click-async="() => reloadLast()">
            Try again
          </AsyncButton>
        </div>
      </ShadcnScrollArea>
    </div>

    <form
      class="relative flex-shrink-0 overflow-hidden border rounded-lg bg-background focus-within:ring-1 focus-within:ring-ring"
      @submit.prevent="submitMessage"
    >
      <ShadcnLabel for="message" class="sr-only">
        Message
      </ShadcnLabel>
      <ShadcnTextarea
        id="message"
        v-model="currentChatMessage"
        placeholder="Type your message here..."
        class="p-3 border-0 shadow-none resize-none min-h-28 focus-visible:ring-0"
        @keydown="handleInputFieldKeyboardEvents"
      />
      <div class="flex flex-wrap items-center p-3 pt-0">
        <ShadcnTooltipProvider>
          <ShadcnTooltip>
            <ShadcnTooltipTrigger as-child>
              <ShadcnButton variant="ghost" size="icon" @click="openFile">
                <Paperclip class="size-4" />
                <span class="sr-only">Attach file</span>
              </ShadcnButton>
            </ShadcnTooltipTrigger>
            <ShadcnTooltipContent side="top">
              Attach File
            </ShadcnTooltipContent>
          </ShadcnTooltip>
          <ShadcnTooltip>
            <ShadcnPopover>
              <ShadcnPopoverTrigger as-child>
                <ShadcnTooltipTrigger as-child>
                  <ShadcnButton variant="ghost" size="icon">
                    <Link class="size-4" />
                    <span class="sr-only">URL context</span>
                  </ShadcnButton>
                </ShadcnTooltipTrigger>
                <ShadcnTooltipContent side="top">
                  URL context
                </ShadcnTooltipContent>
              </ShadcnPopoverTrigger>
              <ShadcnPopoverContent>
                <div class="grid gap-2 mb-1">
                  <ShadcnLabel for="url">
                    URL
                  </ShadcnLabel>
                  <ShadcnInput
                    id="url"
                    v-model="urlToFetchHtmlFrom"
                    type="url"
                    name="url"
                    placeholder="https://example.com"
                    required
                  />
                </div>

                <AsyncButton
                  variant="outline"
                  class="w-full"
                  :is-disabled="urlToFetchHtmlFrom.trim() === ''"
                  :on-click-async="async () => await generateMarkdown()"
                >
                  Add URL for further context
                </AsyncButton>
              </ShadcnPopoverContent>
            </ShadcnPopover>
          </ShadcnTooltip>
          <ShadcnTooltip v-if="isSpeechRecognitionSupported">
            <ShadcnTooltipTrigger as-child>
              <ShadcnButton
                variant="ghost"
                size="icon"
                :class="{
                  'animate-pulse outline-1 outline-destructive outline-dashed':
                    isListeningToSpeech,
                }"
                @click="
                  () => {
                    if (isListeningToSpeech) {
                      console.info('stopping listening');
                      stopSpeechRecognition();
                    }
                    else {
                      console.info('starting listening');
                      startSpeechRecognition();
                    }
                  }
                "
              >
                <Mic class="size-4" />
                <span class="sr-only">Use Microphone</span>
              </ShadcnButton>
            </ShadcnTooltipTrigger>
            <ShadcnTooltipContent side="top">
              Use Microphone
            </ShadcnTooltipContent>
          </ShadcnTooltip>
          <ShadcnTooltip>
            <ShadcnAlertDialog>
              <ShadcnAlertDialogTrigger as-child>
                <ShadcnTooltipTrigger as-child>
                  <ShadcnButton
                    variant="ghost"
                    size="icon"
                    :disabled="
                      chatResponseIsLoading
                        || chatMessages.length === 0
                        || !selectedAiChatIsPlayground
                    "
                  >
                    <Trash2 class="size-4" />
                    <span class="sr-only">Clear Chat</span>
                  </ShadcnButton>
                </ShadcnTooltipTrigger>
                <ShadcnTooltipContent side="top">
                  Clear
                </ShadcnTooltipContent>
              </ShadcnAlertDialogTrigger>
              <ShadcnAlertDialogContent>
                <ShadcnAlertDialogHeader>
                  <ShadcnAlertDialogTitle>
                    Are you sure, that you want to clear the chat?
                  </ShadcnAlertDialogTitle>
                  <ShadcnAlertDialogDescription>
                    Chat messages can not be recovered!
                  </ShadcnAlertDialogDescription>
                </ShadcnAlertDialogHeader>
                <ShadcnAlertDialogFooter>
                  <ShadcnAlertDialogCancel>Cancel</ShadcnAlertDialogCancel>
                  <ShadcnAlertDialogAction @click="resetAiPlaygroundChat">
                    Continue
                  </ShadcnAlertDialogAction>
                </ShadcnAlertDialogFooter>
              </ShadcnAlertDialogContent>
            </ShadcnAlertDialog>
          </ShadcnTooltip>
          <ShadcnTooltip>
            <ShadcnTooltipTrigger as-child>
              <AsyncButton
                variant="ghost"
                size="icon"
                :hide-loader="true"
                :is-disabled="
                  chatResponseIsLoading || chatMessages.length === 0
                "
                :on-click-async="() => reloadLast()"
              >
                <RefreshCcw class="size-4" />
                <span class="sr-only">Refresh Last Response</span>
              </AsyncButton>
            </ShadcnTooltipTrigger>
            <ShadcnTooltipContent side="top">
              Refresh (needed if ai is stuck)
            </ShadcnTooltipContent>
          </ShadcnTooltip>
        </ShadcnTooltipProvider>
        <div class="flex items-center w-full gap-1 sm:ml-auto sm:w-fit">
          <ShadcnTooltipProvider>
            <ShadcnTooltip>
              <ShadcnTooltipTrigger as-child>
                <ShadcnButton
                  variant="outline"
                  size="icon"
                  class="px-2"
                  :disabled="currentChatMessage.trim() === ''"
                  @click="currentChatMessage = ''"
                >
                  <Delete class="w-4 h-4" />
                </ShadcnButton>
              </ShadcnTooltipTrigger>
              <ShadcnTooltipContent side="top">
                Clear Input
              </ShadcnTooltipContent>
            </ShadcnTooltip>
          </ShadcnTooltipProvider>
          <ShadcnButton
            type="submit"
            size="sm"
            class="gap-1.5 w-full"
            :disabled="
              chatResponseIsLoading || currentChatMessage.trim() === ''
            "
          >
            Send Message
            <CornerDownLeft class="size-3.5" />
          </ShadcnButton>
        </div>
      </div>
    </form>
  </div>
</template>

<style scoped lang="postcss">
/* For WebKit browsers (Chrome, Safari, Edge) */
textarea::-webkit-scrollbar {
  width: 4px;
}

textarea::-webkit-scrollbar-thumb {
  @apply bg-foreground;
  border-radius: 100px;
}

textarea::-webkit-scrollbar-track {
  background-color: transparent;
}

/* For Firefox */
textarea {
  scrollbar-width: thin;
  scrollbar-color: hsl(var(--foreground)) transparent;
}
</style>
