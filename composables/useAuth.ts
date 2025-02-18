// Only use on the client-side!
// If used before the component is rendered, it will cause the data to be fetched 2 times, because $fetch and not useFetch is used.
// ([nuxt] [useFetch] Component is already mounted, please use $fetch instead.)
import type { ApiAuthResponse, ApiErrorResponse } from '~/lib/types/api'

export function useAuth() {
  const signIn = async (email: string, password: string) => {
    try {
      const data = await $fetch<ApiAuthResponse>('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      })

      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as ApiErrorResponse }
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      const data = await $fetch<ApiAuthResponse>('/api/auth/sign-up', {
        method: 'POST',
        body: { email, password },
      })

      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as ApiErrorResponse }
    }
  }

  const signOut = async () => {
    try {
      const data = await $fetch<boolean>('/api/auth/logout', { method: 'POST' })

      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as ApiErrorResponse }
    }
  }

  return {
    signIn,
    signUp,
    signOut,
  }
}
