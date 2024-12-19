import { readUserUsingPrimaryEmail, updateUser } from '~/server/database/repositories/users'
import { validateParamEmail } from '~/server/utils/validate'

export default defineEventHandler(async (event) => {
  const storage = useStorage('temporary-storage')
  const otpNameSpace = 'otp'

  const body = await readBody(event)
  const { otp, new_password } = body

  /* VALIDATE PARAMS */
  const maybeUserEmail = await validateParamEmail(event)
  if (maybeUserEmail.statusCode !== 200) {
    return sendError(
      event,
      createError({
        statusCode: maybeUserEmail.statusCode,
        statusMessage: maybeUserEmail.statusMessage,
        data: maybeUserEmail.data,
      }),
    )
  }
  const email = maybeUserEmail.data?.email

  const storedOTPData = await storage.getItem<{ otp: string, createdAt: number }>(`${otpNameSpace}:${email}`)

  if (!storedOTPData) {
    return { success: false, message: 'No OTP found. Please request a new OTP.' }
  }

  const isValid = storedOTPData.otp === otp && Date.now() - storedOTPData.createdAt < 600000 // 10 minutes

  if (isValid) {
    await storage.removeItem(`${otpNameSpace}:${email}`) // Clear OTP after validation

    const user = await readUserUsingPrimaryEmail(email)
    if (!user) {
      return { success: false, message: 'Something went wrong. Could not reset password. Please try again.' } // Do not leak user existence.
    }

    const updatedUser = await updateUser(user.id, undefined, new_password)

    if (updatedUser) {
      return { success: true, message: 'Successfully validated OTP and reset password.' }
    }

    return { success: false, message: 'Something went wrong. Could not reset password. Please try again.' }
  }

  return { success: false, message: 'Invalid or expired OTP.' }
})
