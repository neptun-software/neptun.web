import { z } from 'zod'
import {
  addPasswordFieldIssue,
  confirmPasswordSchema,
  passwordSchema,
} from './password'
import { emailSchema } from './email'

export { confirmPasswordSchema, passwordSchema }

export const UserLogInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export const UserUpdateSchema = z.object({
  email: emailSchema.optional(),
  password: passwordSchema.optional(),
})

export const UserSignUpSchema = z
  .object({
    email: emailSchema,
    ...confirmPasswordSchema,
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      addPasswordFieldIssue('password', ctx)
      addPasswordFieldIssue('confirmPassword', ctx)
    }
  })

// FORM UTILITY FUNCTIONS

function validateInput(input: string, schema: z.ZodString | z.ZodEffects<any>) {
  if (input.length === 0) {
    return []
  }

  const validationResult = schema.safeParse(input)

  if (validationResult.success) {
    return []
  }

  const errorMessages = validationResult.error.issues.map(
    (issue: z.ZodIssue) => issue.message,
  )

  return errorMessages
}

export function validateEmailInput(email: string) {
  return validateInput(email, emailSchema)
}

export function validatePasswordInput(password: string) {
  return validateInput(password, passwordSchema)
}
