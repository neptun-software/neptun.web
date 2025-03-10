import type { User } from './user'

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
