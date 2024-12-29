import { z } from 'zod'

export const emailSchema = z.string().min(5, {
  message: 'Email must be at least 5 characters',
}).max(256, {
  message: 'Email must be at most 256 characters',
}).email() // a@b.c => 5
