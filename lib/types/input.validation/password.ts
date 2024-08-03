import { z } from 'zod';

const MIN_LENGTH = 8;
const FIELD_VALIDATION = {
  TEST: {
    SPECIAL_CHAR: (value: string) =>
      /[-._!"`'#%&,:;<>=@{}~\$\(\)\*\+\/\\\?\[\]\^\|]+/.test(value),
    LOWERCASE: (value: string) => /[a-z]/.test(value),
    UPPERCASE: (value: string) => /[A-Z]/.test(value),
    NUMBER: (value: string) => /.*[0-9].*/.test(value),
  },
  MSG: {
    MIN_LEN: `Password must have ${MIN_LENGTH} characters`,
    SPECIAL_CHAR: 'Password must contain at least one special character',
    LOWERCASE: 'Password must contain at least one lowercase letter',
    UPPERCASE: 'Password must contain at least one uppercase letter',
    NUMBER: 'Password must contain at least one number',
    MATCH: 'Password must match',
  },
};

export const patterns = z
  .string()
  .min(MIN_LENGTH, {
    message: FIELD_VALIDATION.MSG.MIN_LEN,
  })
  .refine(FIELD_VALIDATION.TEST.SPECIAL_CHAR, FIELD_VALIDATION.MSG.SPECIAL_CHAR)
  .refine(FIELD_VALIDATION.TEST.LOWERCASE, FIELD_VALIDATION.MSG.LOWERCASE)
  .refine(FIELD_VALIDATION.TEST.UPPERCASE, FIELD_VALIDATION.MSG.UPPERCASE)
  .refine(FIELD_VALIDATION.TEST.NUMBER, FIELD_VALIDATION.MSG.NUMBER);

export const addPasswordFieldIssue = (field: string, ctx: z.RefinementCtx) => {
  ctx.addIssue({
    code: 'custom',
    message: FIELD_VALIDATION.MSG.MATCH,
    path: [field],
    fatal: true,
  });
};

export const passwordSchema = patterns;

export const confirmPasswordSchema = {
  password: patterns,
  confirmPassword: patterns,
};
