import type { FetchError } from 'ofetch'
import type { z } from 'zod'

export type ApiValidationError = FetchError & {
  data?: {
    data?: {
      issues: z.ZodIssue[]
    }
  }
}

export interface ApiAuthResponse {
  user: {
    id: number
    primary_email: string
  }
  loggedInAt: Date
}

export type ApiErrorResponse = ApiValidationError | FetchError
