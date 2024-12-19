import type { User } from '#auth-utils'

declare module 'h3' {
  interface H3EventContext {
    user: User
    validated: {
      params: Record<string, any>
      query: Record<string, any>
    }
  }
}

export {}
