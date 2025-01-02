import type { AsyncDataRequestStatus } from '#app'
import type { FetchError } from 'ofetch'
import { computed, ref } from 'vue'

interface UseFetchResourceOptions<T> {
  transform?: (data: T) => T
  requiresAuth?: boolean
}

export function useFetchResource<T>(url: string, options: UseFetchResourceOptions<T> = {}) {
  const data = ref<T>()
  const error = ref<FetchError<any> | null>(null)
  const status = ref<AsyncDataRequestStatus>('idle')
  const password = ref<string>('')

  const credentials = computed(() => {
    const pw = password.value?.trim()
    if (!pw) {
      return null
    }

    // Backend expects empty username
    return btoa(`:${pw}`)
  })

  const execute = async () => {
    status.value = 'pending'

    try {
      const headers: Record<string, string> = {}
      if (options.requiresAuth && credentials.value) {
        headers.Authorization = `Basic ${credentials.value}`
      }

      const response = await $fetch<T>(url, {
        headers,
      })

      if (response !== null) {
        data.value = options.transform ? options.transform(response as T) : response as T
        status.value = 'success'
        error.value = null
      }
    } catch (e: any) {
      error.value = e
      status.value = 'error'
    }
  }

  return {
    data,
    error,
    status,
    execute,
    ...(options.requiresAuth ? { password } : {}),
  }
}
