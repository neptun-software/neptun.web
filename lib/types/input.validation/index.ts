import { z } from 'zod';
import {
  passwordSchema,
  confirmPasswordSchema,
  addPasswordFieldIssue
} from './password'

export { passwordSchema, confirmPasswordSchema };

export const emailSchema = z.string().min(5).email(); // a@b.c => 5

export const UserLogInSchema = z.object({
  email: emailSchema,
  password: passwordSchema
})

export const UserUpdateSchema = z.object({
  email: emailSchema.optional(),
  password: passwordSchema.optional()
})

export const UserSignUpSchema = z
  .object({
    email: emailSchema,
    ...confirmPasswordSchema
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      addPasswordFieldIssue('password', ctx);
      addPasswordFieldIssue('confirmPassword', ctx);
    }
  });

// FORM UTILITY FUNCTIONS

function validateInput(input: string, schema: z.ZodString | z.ZodEffects<any>) {
  if (input.length === 0) return [];

  const validationResult = schema.safeParse(input);

  if (validationResult.success) return [];

  const errorMessages = validationResult.error.issues.map(
    (issue: any) => issue.message
  );

  return errorMessages as never[];
}

export function validateEmailInput(email: string) {
  return validateInput(email, emailSchema);
}

export function validatePasswordInput(password: string) {
  return validateInput(password, passwordSchema);
}
