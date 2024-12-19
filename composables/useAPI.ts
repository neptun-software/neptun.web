import type { AsyncDataRequestStatus } from '#app'
import type { HTTPMethod } from 'h3'
import type { AsyncDataOptions, UseFetchOptions } from 'nuxt/app'
import type { FetchError } from 'ofetch'
import type { FullyFeaturedChat /* , MinimalChat */ } from '~/lib/types/chat'
import type {
  ReadChatConversationFile,
  ReadChatConversationMessage,
} from '~/lib/types/database.tables/schema'
import { toast } from 'vue-sonner'
import { getCodeBlocksFromMarkdown } from '~/utils/parse'

const { console } = useLogger()

/* import type { UseFetchOptions } from '#app'; */

// TODO: improve => return _data, isLoading etc. too.
/* interface FetchResponse<T> extends Response {
  _data?: T
} */

export function useAPI() {
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

        for (const message of messagesPersisted.chatMessages) {
          if (message.actor === 'assistant') {
            try {
              await persistCodeBlocks(
                message.neptun_user_id,
                message.chat_conversation_id,
                message.id,
                message.message,
              )
            } catch {
              console.error('Failed to persist code blocks!')
            }
          }
        }
      } catch {
        console.error('Failed to persist chat messages!')
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
          const persistedCodeBlocks = await $fetch(
            `/api/users/${user_id}/chats/${chat_id}/files/${message_id}`,
            {
              method: 'POST',
              body: {
                files: codeBlocks,
              },
            },
          )

          return persistedCodeBlocks
        } catch {
          console.error('Failed to persist code blocks!')
        }
      }
    } catch {
      console.error('Failed to parse code blocks!')
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
        const _data = await $fetch(
          `/api/users/${user_id}/chats/${chat_id}/files`,
        )
        if (_data.chatFiles && _data.chatFiles.length > 0) {
          const chatFiles = _data.chatFiles
          fetchedFiles.value = (chatFiles as ReadChatConversationFile[]) ?? []
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
