import type { User as BaseUser } from './user'

declare module '#auth-utils' {
  interface User extends BaseUser {
    webauthn?: boolean
  }

  interface UserSession {
    loggedInAt: Date
  }
}

export { }
