<script setup lang="ts">
import type { Message } from '~/lib/types/models/chat'
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
import maximizeMinimizeJson from '~/assets/icons/Maximize-minimize/maximizeMinimize.json'
import { POSSIBLE_AI_MODELS } from '~/lib/data/ai.models'
import { AllowedAiModelsEnum } from '~/lib/types/models/ai'

const { $toast } = useNuxtApp()
const { console } = useLogger()
const { loadFiles } = useFetchFiles()
const { user } = useUserSession()
const {
  aiPlaygroundChatMessages: currentAiChatPlaygroundMessagesBackup,
  resetAiPlaygroundChat,
} = useAiChatPlayground()
const { generateMarkdownFromUrl } = useDashboard()
const { isZenMode, toggleZenMode } = useUiStore()

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
  stop: stopChatGeneration,
  status: chatStatus
  /* append: appendChatMessage, */
} = useChat({
  id: String(selectedAiChat.value.id),
  api: selectedAiChatKey.value,
  keepLastMessageOnError: true,
})

const isLoading = ref(true)
const autoScrollEnabled = ref(true)

watch(() => currentChatMessage.value, (newMessage) => {
  if (newMessage !== '' && autoScrollEnabled.value) {
    scrollToBottom('instant')
  }
}, { immediate: true })

watch(chatError, () => {
  if (chatError.value) {
    $toast.error(`Chat error!`)
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

const chatMessagesKey = computed(() => {
  return `${selectedAiChat.value.id}-${chatMessages.value.length}`
})
const { setPromiseToast, cleanup: cleanupToasts } = useToastState()
const currentPromiseToast = ref<{ requestId: string, isWaiting: ComputedRef<boolean> } | null>(null)

watch(
  () => chatMessages.value.length,
  async () => {
    const aiIsDoneResponding = waitForValidRef(chatResponseIsLoading)

    if (
      chatMessages.value[chatMessages.value.length - 1]?.role === 'assistant'
      && !isLoading.value // !isLoading.value needed, so that it only shows the toast, if the messages are actually new, and not onMounted (onLoaded)
    ) {
      currentPromiseToast.value = setPromiseToast(aiIsDoneResponding, {
        loadingMessage: 'Fetching AI response...',
        successMessage: 'AI response fetched!',
        errorMessage: 'Failed to fetch AI response!',
      })
    }

    await aiIsDoneResponding
    if (selectedAiChat.value.id !== -1) {
      await loadFiles(user.value?.id ?? -1, selectedAiChat.value.id)
    }

    console.info('Setting chat history messages backup...')
    if (selectedAiChatIsPlayground.value && chatMessages.value.length > 0) {
      currentAiChatPlaygroundMessagesBackup.value = chatMessages.value
    }
  },
)

onUnmounted(cleanupToasts)

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
    $toast.error(
      'Speech recognition was disabled for this page!\nPlease allow it, to use the feature!',
    )
  } else {
    $toast.error(
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
        $toast.error('File type not supported!')
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
const loadedChats = useState('loaded-chats', () => new Set())
async function loadChatMessages(user_id: number, chat_id: number) {
  // Skip if we already have messages for this chat
  if (loadedChats.value.has(chat_id) && chatMessages.value.length > 0) {
    return
  }

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

const maxTokens = computed(() => {
  const [publisher, model] = selectedAiChat.value.model.split('/')
  return POSSIBLE_AI_MODELS[publisher]?.[model]?.configuration('')?.parameters?.truncate ?? 7500
})

const isOverMaxTokens = computed(() => currentChatMessage.value.length > maxTokens.value)

const shouldLoadMessages = computed(() => {
  return !loadedChats.value.has(selectedAiChat.value.id) || chatMessages.value.length === 0
})

onMounted(async () => {
  if (!shouldLoadMessages.value) {
    isLoading.value = false
    return
  }

  isLoading.value = true
  await loadChatMessages(user.value?.id ?? -1, selectedAiChat.value.id).then(
    () => {
      isLoading.value = false
      loadedChats.value.add(selectedAiChat.value.id)
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

  if ($actualScrollArea.value) {
    let lastHeight = $actualScrollArea.value.scrollHeight
    useMutationObserver(
      $actualScrollArea.value,
      () => {
        if (
          (autoScrollEnabled.value && chatResponseIsLoading.value)
          || (autoScrollEnabled.value && !(selectedAiChat.value.model === AllowedAiModelsEnum.DeepSeekR1)) // including DeepSeekR1 would scroll, when details is opened- or closed
        ) {
          const currentHeight = $actualScrollArea.value!.scrollHeight
          if (currentHeight !== lastHeight) {
            nextTick(() => {
              scrollToBottom('instant')
            })
            lastHeight = currentHeight
          }
        }
      },
      {
        childList: true,
        subtree: true,
        characterData: true,
      },
    )
  }
})

let lastScrollTop = 0
useEventListener($actualScrollArea, 'scroll', () => {
  if (!$actualScrollArea.value || !chatResponseIsLoading.value) {
    return
  }

  const scrollTop = $actualScrollArea.value.scrollTop
  if (scrollTop < lastScrollTop) {
    autoScrollEnabled.value = false
  }

  lastScrollTop = scrollTop
})

function scrollToBottom(behavior: 'instant' | 'smooth' = 'smooth') {
  if (!$actualScrollArea.value) {
    return
  }

  $actualScrollArea.value.scrollTo({
    top: $actualScrollArea.value.scrollHeight,
    behavior,
  })
}

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
  if (isOverMaxTokens.value) {
    $toast.error(`Message is too long! Maximum length is ${maxTokens.value} characters.`)
    return
  }
  globalChatMessage.value = currentChatMessage.value
  currentChatMessageCommit()
  handleChatMessageSubmit()
}

async function reloadLast() {
  if (!selectedAiChatIsPlayground.value) {
    await deleteLast()
  }

  await reloadLastChatMessage()
    .then(() => {
      $toast.success('Chat message reloaded!')
    })
    .catch(() => {
      $toast.error('Failed to reload chat message!')
    })
}

async function deleteLast() {
  if (selectedAiChatIsPlayground.value) {
    return
  }

  await $fetch(
    `/api/users/${user.value?.id ?? -1}/chats/${selectedAiChat.value.id}/messages/last`,
    {
      method: 'DELETE',
    },
  )
    .then(async () => {
      $toast.success('Chat message deleted!')
    })
    .catch(() => {
      $toast.error('Failed to delete chat message!')
    })
}

async function downloadChatMessages(_event = null) {
  await downloadAsFile(chatMessages.value, 'chat-messages', 'application/json', 'json')
}

const messagesWithStreaming = computed(() => {
  return chatMessages.value.map((message) => {
    if (message.role === 'assistant'
      && message === chatMessages.value[chatMessages.value.length - 1]) {
      return {
        ...message,
        isStreaming: chatResponseIsLoading.value,
      }
    }

    return message
  })
})

function stopGeneration() {
  if (chatResponseIsLoading.value) {
    stopChatGeneration()
    $toast.success('Chat generation stopped')
  }
}

function appendContextToInput(context: string) {
  currentChatMessage.value += context
}
</script>

<template>
  <div class="flex relative flex-col order-1 p-4 bg-muted/50 2xl:order-2" :class="{ 'rounded-xl h-full min-h-[60vh] max-h-[75vh]': !isZenMode, 'h-screen': isZenMode }">
    <div class="absolute top-3 left-3 z-10 pb-2">
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
            <DashboardChatModelConfiguration />
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
              <DashboardChats />
              <ShadcnSeparator class="my-1 bg-transparent" />
            </ShadcnScrollArea>
          </ShadcnDialogContent>
        </ShadcnDialog>

        <ShadcnTooltipProvider>
          <ShadcnTooltip>
            <ShadcnTooltipTrigger as-child>
              <AsyncButton
                size="icon" variant="ghost" :hide-loader="false" :is-disabled="chatMessages.length === 0"
                :on-click-async="() => downloadChatMessages()"
              >
                <Download class="size-6" />
                <span class="sr-only">Download Chat</span>
              </AsyncButton>
            </ShadcnTooltipTrigger>
            <ShadcnTooltipContent side="top">
              Download chat messages as JSON.
            </ShadcnTooltipContent>
          </ShadcnTooltip>

          <ShadcnTooltip>
            <ShadcnTooltipTrigger as-child>
              <DashboardChatShareDialog />
            </ShadcnTooltipTrigger>
            <ShadcnTooltipContent side="top">
              Share the chat with others.
            </ShadcnTooltipContent>
          </ShadcnTooltip>

          <ShadcnTooltip>
            <ShadcnTooltipTrigger as-child>
              <ShadcnButton
                size="icon" variant="ghost" :disabled="chatMessages.length === 0 || chatResponseIsLoading"
                @click="scrollToBottom()"
              >
                <Mouse class="size-6" />
                <span class="sr-only">Scroll to bottom</span>
              </ShadcnButton>
            </ShadcnTooltipTrigger>
            <ShadcnTooltipContent side="top">
              Scroll to the bottom of the chat.
            </ShadcnTooltipContent>
          </ShadcnTooltip>

          <ShadcnToggle :pressed="autoScrollEnabled" class="px-2" @update:pressed="autoScrollEnabled = $event">
            <ShadcnTooltip>
              <ShadcnTooltipTrigger as-child>
                <div>
                  <Icon icon="mdi:automatic" class="size-6" />
                  <span class="sr-only">
                    {{ autoScrollEnabled ? 'Disable' : 'Enable' }} auto-scroll
                  </span>
                </div>
              </ShadcnTooltipTrigger>
              <ShadcnTooltipContent side="top">
                Toggle auto-scrolling.
              </ShadcnTooltipContent>
            </ShadcnTooltip>
          </ShadcnToggle>

          <ShadcnTooltip>
            <ShadcnTooltipTrigger as-child>
              <ShadcnButton
                variant="ghost"
                size="icon"
                @click="toggleZenMode"
              >
                <span v-once>
                  <AnimatedIcon :animation-data="maximizeMinimizeJson" :is-active="isZenMode" />
                </span>
                <span class="sr-only">
                  {{ isZenMode ? 'Exit' : 'Enter' }} zen mode
                </span>
              </ShadcnButton>
            </ShadcnTooltipTrigger>
            <ShadcnTooltipContent side="top">
              Toggle zen-mode.
            </ShadcnTooltipContent>
          </ShadcnTooltip>
        </ShadcnTooltipProvider>
      </div>
    </div>

    <div class="flex absolute top-3 right-3 z-10 items-end bg-transparent">
      <ShadcnBadge variant="outline" :class="{ 'text-destructive border-destructive': isOverMaxTokens }">
        {{ currentChatMessage.length }}/{{ maxTokens }}
      </ShadcnBadge>
      <ShadcnBadge variant="outline" class="ml-1">
        {{ selectedAiChat.name }}
      </ShadcnBadge>
    </div>

    <div class="flex flex-col flex-grow pt-10 pb-6 max-w-full min-h-0">
      <ShadcnScrollArea ref="$scrollArea" class="h-full">
        <KeepAlive>
          <template v-if="messagesWithStreaming.length === 0">
            <div class="pt-8 text-center text-muted-foreground">
              <p>Start a conversation with the AI</p>
            </div>
          </template>
          
          <template v-else>
            <DashboardChatMessage 
              v-for="message in messagesWithStreaming"
              :key="message.id"
              :message="message"
            />
          </template>
        </KeepAlive>

        <template v-if="isLoading">
          <MessagesSkeleton />
        </template>

        <!-- User Input Draft -->
        <div v-if="currentChatMessage.trim() !== ''" class="flex justify-end mt-8 mb-2">
          <div
            class="px-4 py-2 whitespace-pre-wrap break-words rounded-lg border border-orange-300 bg-background" style="max-width: 50vw;"
          >
            {{ currentChatMessage }}
          </div>
        </div>

        <InfoBlock show-loader show-dots :is-visible="chatResponseIsLoading">
          Waiting for response
        </InfoBlock>

        <div
          v-if="chatError"
          class="flex flex-wrap items-center p-4 mt-8 w-full font-black uppercase rounded-md border-2 text-ellipsis border-destructive"
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
      class="overflow-hidden relative flex-shrink-0 rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring"
      @submit.prevent="submitMessage"
    >
      <ShadcnLabel for="message" class="sr-only">
        Message
      </ShadcnLabel>
      <ShadcnTextarea
        id="message" v-model="currentChatMessage" placeholder="Type your message here..."
        class="overflow-y-auto p-3 whitespace-pre-wrap break-words border-0 shadow-none resize-none focus-visible:ring-0 min-h-28"
        :class="{ 'text-destructive': isOverMaxTokens }" @keydown="handleInputFieldKeyboardEvents"
      />
      <div class="flex flex-wrap items-center p-3 pt-0">
        <DashboardChatContextPopover @context-added="appendContextToInput" />
        <ShadcnTooltipProvider>
          <ShadcnTooltip>
            <ShadcnTooltipTrigger as-child>
              <ShadcnButton variant="ghost" size="icon" :disabled="isOverMaxTokens" @click="openFile">
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
                  <ShadcnButton variant="ghost" size="icon" :disabled="isOverMaxTokens">
                    <Link class="size-4" />
                    <span class="sr-only">URL Context</span>
                  </ShadcnButton>
                </ShadcnTooltipTrigger>
                <ShadcnTooltipContent side="top">
                  URL Context
                </ShadcnTooltipContent>
              </ShadcnPopoverTrigger>
              <ShadcnPopoverContent>
                <div class="grid gap-2 mb-1">
                  <ShadcnLabel for="url">
                    URL
                  </ShadcnLabel>
                  <ShadcnInput
                    id="url" v-model="urlToFetchHtmlFrom" type="url" name="url"
                    placeholder="https://example.com" required
                  />
                </div>

                <AsyncButton
                  variant="outline" class="w-full" :is-disabled="urlToFetchHtmlFrom.trim() === ''"
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
                type="button" variant="ghost" size="icon" :disabled="isOverMaxTokens" :class="{
                  'animate-pulse outline-1 outline-destructive outline-dashed':
                    isListeningToSpeech,
                }" @click="() => {
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
                    variant="ghost" size="icon" :disabled="chatResponseIsLoading
                      || chatMessages.length === 0
                      || !selectedAiChatIsPlayground
                    "
                  >
                    <Trash2 class="size-4" />
                    <span class="sr-only">Clear Chat</span>
                  </ShadcnButton>
                </ShadcnTooltipTrigger>
                <ShadcnTooltipContent side="top">
                  Clear Chat
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
                  <ShadcnAlertDialogAction @click="resetAiPlaygroundChat(selectedAiChat.model)">
                    Continue
                  </ShadcnAlertDialogAction>
                </ShadcnAlertDialogFooter>
              </ShadcnAlertDialogContent>
            </ShadcnAlertDialog>
          </ShadcnTooltip>
          <ShadcnTooltip>
            <ShadcnTooltipTrigger as-child>
              <AsyncButton
                variant="ghost" size="icon" :hide-loader="true" :is-disabled="chatResponseIsLoading || chatMessages.length === 0
                " :on-click-async="() => reloadLast()"
              >
                <RefreshCcw class="size-4" />
                <span class="sr-only">Regenerate Last Message</span>
              </AsyncButton>
            </ShadcnTooltipTrigger>
            <ShadcnTooltipContent>
              <p>Regenerate Last Message</p>
            </ShadcnTooltipContent>
          </ShadcnTooltip>
        </ShadcnTooltipProvider>
        <div class="flex gap-1 items-center w-full sm:ml-auto sm:w-fit">
          <ShadcnTooltipProvider>
            <ShadcnTooltip>
              <ShadcnTooltipTrigger as-child>
                <ShadcnButton
                  variant="outline" size="icon" class="px-2" :disabled="currentChatMessage.trim() === ''"
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
          <template v-if="chatResponseIsLoading">
            <ShadcnButton
              type="button" size="sm" class="gap-1.5 px-2" :disabled="!chatResponseIsLoading"
              @click="stopGeneration"
            >
              Stop Generating
              <Icon icon="lsicon:stop-filled" class="size-4" />
            </ShadcnButton>
          </template>
          <template v-else>
            <ShadcnButton
              type="submit" size="sm" class="gap-1.5 w-full" :disabled="chatResponseIsLoading || currentChatMessage.trim() === '' || isOverMaxTokens"
            >
              Send Message
              <CornerDownLeft class="size-4" />
            </ShadcnButton>
          </template>
        </div>
      </div>
    </form>
  </div>
</template>

<style scoped lang="postcss">
</style>
