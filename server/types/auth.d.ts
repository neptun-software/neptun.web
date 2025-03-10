import type { User as BaseUser } from './user'

declare module '#auth-utils' {
  interface User extends BaseUser { }

  interface UserSession {
    loggedInAt: Date
  }
}

export { }
