declare module '#auth-utils' {
  interface User {
    id: number
    primary_email: string
    oauth?: {
      github?: {
        github_id?: string
        github_email?: string
      }
      google?: {
        google_id?: string
        google_email?: string
      }
    }
  }

  interface UserSession {
    loggedInAt: Date
  }
}

export {}
