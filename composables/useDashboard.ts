import type { AsyncDataRequestStatus } from '#app'
import type { HTTPMethod } from 'h3'
import type { AsyncDataOptions, UseFetchOptions } from 'nuxt/app'
import type { FetchError } from 'ofetch'
import type {
  ReadChatConversationFile,
  ReadChatConversationMessage,
} from '~/lib/types/database.tables/schema'
import type { FullyFeaturedChat } from '~/lib/types/models/chat'
import { toast } from 'vue-sonner'
import { getCodeBlocksFromMarkdown } from '~/utils/parse'

const { console } = useLogger()

/* import type { UseFetchOptions } from '#app'; */

// TODO: improve => return _data, isLoading etc. too.
/* interface FetchResponse<T> extends Response {
  _data?: T
} */

export function useDashboard() {
  const handleFetch = async <T>(
    url: string,
    options: UseFetchOptions<T> = {},
    toastMessages: {
      loading: string
      success: (_data: unknown) => string
      error: (_data: unknown) => string
    } | null = null,
  ): Promise<T> => {
    const fetchPromise = new Promise<T>((resolve, reject) => {
      console.info('Starting fetch request to:', url, 'with options:', options)

      useFetch(url, {
        ...options,
        onRequest({ request, options }) {
          console.log('Request:', request, 'Options:', options)
        },
        onRequestError({ request, options, error }) {
          console.error('Request error:', error)
          reject(error)
        },
        onResponse({ request, response, options }) {
          console.log('Response received:', response)

          if (response.ok && response._data) {
            // THIS IS CALLED EVERY TIME, ALSO IF RESPONSE IS NOT OK!
            console.log('Response data:', response._data)
            resolve(response._data as T)
          } else {
            const error = new Error(
              `Response not ok or no data: ${response.statusText}`,
            )

            console.error('Response error:', error)

            reject(error)
          }
        },
        onResponseError({ request, response, options }) {
          console.error('Response error data:', response._data)
          reject(response._data || new Error(`HTTP ${response.status}`))
        },
      }).catch((error) => {
        console.error('Fetch error:', error)
        reject(error)
      })
    })

    if (toastMessages) {
      toast.promise(fetchPromise, {
        ...toastMessages,
        error: (error: any) => {
          console.error('Toast error:', error)
          return toastMessages.error(error)
        },
      })
    }

    return fetchPromise
  }

  const generateMarkdownFromUrl = async (
    url: string,
    currentChatMessage: string,
  ): Promise<string | undefined> => {
    if (url.trim() === '') {
      return
    }

    try {
      // eslint-disable-next-line no-new
      new URL(url)
    } catch {
      toast.error('Invalid URL!')
      return
    }

    const endpoint = '/api/html-to-markdown/'
    const encodedUrl = encodeURIComponent(url)

    const toastMessages = {
      loading: 'Fetching URL and converting its HTML content to Markdown...',
      success: (_data: unknown) =>
        'Successfully fetched the URL and converted its HTML content to Markdown!',
      error: (_data: unknown) =>
        'Failed to fetch the URL and convert its HTML content to Markdown!',
    }

    try {
      const markdownOfUrl = await handleFetch<string>(
        `${endpoint}${encodedUrl}`,
        {},
        toastMessages,
      )
      return currentChatMessage + markdownOfUrl
    } catch {
      return currentChatMessage
    }
  }

  const persistChatConversationMessagesOfPlayground = async (
    user_id: number,
    chat_id: number, /* , messages: Message[] */
  ) => {
    const { aiPlaygroundChatMessages: messagesRef } = useAiChatPlayground()
    const messages = messagesRef.value

    console.log('Starting message persistence with:', {
      user_id,
      chat_id,
      messages,
    })

    if (!messages) {
      console.error('No messages to persist!')
      return
    }

    if (messages.length > 0) {
      const url = `/api/users/${user_id}/chats/${chat_id}/messages`
      const options = {
        method: 'POST' as HTTPMethod,
        body: { messages },
        lazy: true,
      }

      console.log('Attempting to persist messages with:', {
        url,
        options,
      })

      const toastMessages = {
        loading: 'Persisting chat messages...',
        success: (_data: unknown) => 'Chat messages persisted!',
        error: (_data: unknown) => 'Failed to persist chat messages!',
      }

      console.info('Persisting messages...', messages)

      try {
        const messagesPersisted = await handleFetch<{
          chatMessages: ReadChatConversationMessage[]
        }>(url, options, toastMessages)

        console.log('Messages persisted successfully:', messagesPersisted)

        for (const message of messagesPersisted.chatMessages) {
          if (message.actor === 'assistant') {
            try {
              console.log('Attempting to persist code blocks for message:', message.id)

              const codeBlocksResult = await persistCodeBlocks(
                message.neptun_user_id,
                message.chat_conversation_id,
                message.id,
                message.message,
              )

              console.log('Code blocks persistence result:', codeBlocksResult)
            } catch (error) {
              console.error('Failed to persist code blocks!', error)
            }
          }
        }
      } catch (error) {
        console.error('Failed to persist chat messages!', {
          error,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        })
      }

      messagesRef.value = []
    }
  }

  const persistChatConversation = async (
    user_id: number,
    name: string,
    model: string,
  ) => {
    const url = `/api/users/${user_id}/chats`
    const options = {
      method: 'POST' as HTTPMethod,
      body: { model, name },
      lazy: true,
      pick: ['chat'] as 'chat'[],
    }

    const toastMessages = {
      loading: 'Persisting chat history...',
      success: (_data: unknown) => 'Chat history persisted!',
      error: (_data: unknown) => 'Failed to persist chat history!',
    }

    try {
      const response = await handleFetch<{ chat: FullyFeaturedChat }>(
        url,
        options,
        toastMessages,
      )

      await persistChatConversationMessagesOfPlayground(
        user_id,
        response.chat.id,
      )

      return response.chat.id
    } catch {
      console.error('Failed to persist chat history!')
    }
  }

  async function persistCodeBlocks(
    user_id: number,
    chat_id: number,
    message_id: number,
    markdown: string,
  ) {
    try {
      const codeBlocks = await getCodeBlocksFromMarkdown(markdown)

      if (codeBlocks.length > 0) {
        try {
          const files = codeBlocks.map(block => ({
            neptun_user_id: user_id,
            chat_conversation_id: chat_id,
            chat_conversation_message_id: message_id,
            title: block.title,
            text: block.text,
            language: block.language,
            extension: block.extension,
          }))

          const requestBody = files.length === 1 ? files[0] : { files }

          const persistedCodeBlocks = await $fetch(
            `/api/users/${user_id}/chats/${chat_id}/files/${message_id}`,
            {
              method: 'POST',
              body: requestBody,
            },
          )

          return persistedCodeBlocks
        } catch (error) {
          console.error('Failed to persist code blocks!', error)
        }
      }
    } catch (error) {
      console.error('Failed to parse code blocks!', error)
    }

    return null
  }

  const persistChatConversationEdit = async (
    user_id: number,
    chat_id: number,
    chat_name: string,
  ) => {
    const url = `/api/users/${user_id}/chats/${chat_id}`
    const options = {
      method: 'PATCH' as HTTPMethod,
      body: { name: chat_name },
      lazy: true,
    }

    const toastMessages = {
      loading: 'Renaming chat...',
      success: (_data: unknown) => 'Chat renamed!',
      error: (_data: unknown) => 'Failed to rename chat!',
    }

    try {
      return await handleFetch<{ chat: FullyFeaturedChat }>(
        url,
        options,
        toastMessages,
      )
    } catch {
      console.error('Failed to rename chat!')
    }
  }

  const persistChatConversationDelete = async (
    user_id: number,
    chat_id: number | number[],
  ): Promise<void> => {
    if (!Array.isArray(chat_id)) {
      const url = `/api/users/${user_id}/chats/${chat_id}`
      const options = {
        method: 'DELETE' as HTTPMethod,
        lazy: true,
      }

      const toastMessages = {
        loading: 'Deleting chat...',
        success: (_data: unknown) => 'Chat deleted!',
        error: (_data: unknown) => 'Failed to delete chat!',
      }

      try {
        await handleFetch(url, options, toastMessages)
      } catch {
        console.error('Failed to delete chat!')
      }

      return
    }

    const url = `/api/users/${user_id}/chats`
    const options = {
      method: 'DELETE' as HTTPMethod,
      lazy: true,
      body: { chat_ids: chat_id },
    }

    const toastMessages = {
      loading: 'Deleting chats...',
      success: (_data: unknown) => 'Chats deleted!',
      error: (_data: unknown) => 'Failed to delete chats!',
    }

    try {
      await handleFetch(url, options, toastMessages)
    } catch {
      console.error('Failed to delete chats!')
    }
  }

  return {
    generateMarkdownFromUrl,
    persistChatConversation,
    persistChatConversationEdit,
    persistChatConversationDelete,
  }
}

// Pilot Composable for extended opportunities
export function useFetchChats(user_id: number) {
  const fetchedChats = useState<{ chats: FullyFeaturedChat[] } | null>(
    'fetched-chats',
    () => null,
  )
  const fetchedChatsStatus = useState<AsyncDataRequestStatus>(
    'fetched-chats-status',
    () => 'pending',
  )
  const fetchedChatsError = useState<FetchError | null>(
    'fetched-chats-error',
    () => null,
  )
  // biome-ignore lint/suspicious/noExplicitAny: Can be any.
  const fetchedChatsRefresh = useState<
    (opts?: AsyncDataOptions<any, any>) => Promise<void>
  >('fetched-chats-refresh', () => async () => Promise.resolve()) // any should be AsyncDataExecuteOptions, but I can not find the type

  const chatsFilters = useChatsFilter()
  const fetchChatsUrl = computed(() => {
    return `/api/users/${user_id}/chats?${chatsFilters.value}`
  })

  const { data, status, error, refresh } = useFetch(fetchChatsUrl, {
    method: 'GET',
    immediate: true,
    watch: [fetchChatsUrl],
    transform: (response) => {
      return response as { chats: FullyFeaturedChat[] }
    },
  })

  watchEffect(() => {
    fetchedChats.value = data.value
    fetchedChatsStatus.value = status.value
    fetchedChatsError.value = error.value
    fetchedChatsRefresh.value = refresh
  })

  return {
    fetchChatsUrl,
    fetchedChats,
    fetchedChatsStatus,
    fetchedChatsError,
    fetchedChatsRefresh,
  }
}

export function useFetchFiles() {
  const fetchedFiles = useState<ReadChatConversationFile[]>(
    'fetched-files',
    () => [],
  )

  async function loadFiles(user_id: number, chat_id: number) {
    fetchedFiles.value = []
    if (user_id !== -1) {
      if (chat_id === -1) {
        return
      }

      try {
        const data = await $fetch<{ chatFiles: ReadChatConversationFile[] }>(
          `/api/users/${user_id}/chats/${chat_id}/files`,
        )

        if (data.chatFiles && data.chatFiles.length > 0) {
          fetchedFiles.value = data.chatFiles
        }
      } catch {
        console.error('Failed to fetch files!')
      }
    }
  }

  return {
    fetchedFiles,
    loadFiles,
  }
}
