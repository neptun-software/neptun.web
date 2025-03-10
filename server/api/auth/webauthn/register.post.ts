import type { VerifiedRegistrationResponse } from '@simplewebauthn/server'
import type { H3Event } from 'h3'
import type { WebAuthnCredential, WebAuthnUser } from '~/server/types/webauthn'
import { z } from 'zod'
import { readUserUsingPrimaryEmail } from '~/server/database/repositories/users'
import { createWebAuthnCredential, getAndDeleteWebAuthnChallenge, saveWebAuthnChallenge } from '~/server/database/repositories/webauthnCredentials'

export default defineWebAuthnRegisterEventHandler({
  async storeChallenge(event: H3Event, challenge: string, attemptId: string) {
    await saveWebAuthnChallenge(attemptId, challenge)
  },

  async getChallenge(event: H3Event, attemptId: string) {
    const challenge = await getAndDeleteWebAuthnChallenge(attemptId)
    if (!challenge) {
      throw createError({ statusCode: 400, message: 'Challenge expired' })
    }
    return challenge
  },

  async validateUser(userBody: WebAuthnUser, event: H3Event) {
    const validatedData = z.object({
      userName: z.string().email(),
    }).parse(userBody)

    const user = await readUserUsingPrimaryEmail(validatedData.userName)
    if (!user) {
      throw createError({ statusCode: 400, message: 'User not found' })
    }

    return validatedData
  },

  async onSuccess(
    event: H3Event,
    {
      credential,
      user,
      registrationInfo,
    }: {
      credential: WebAuthnCredential
      user: WebAuthnUser
      registrationInfo: NonNullable<VerifiedRegistrationResponse['registrationInfo']>
    },
  ) {
    const dbUser = await readUserUsingPrimaryEmail(user.userName)
    if (!dbUser) {
      throw createError({ statusCode: 400, message: 'User not found' })
    }

    await createWebAuthnCredential({
      id: credential.id,
      user_id: dbUser.id,
      public_key: credential.publicKey,
      counter: credential.counter,
      backed_up: credential.backedUp,
      transports: (credential.transports || []).join(','),
    })

    await setUserSession(event, {
      user: {
        id: dbUser.id,
        primary_email: dbUser.primary_email,
        webauthn: true,
      },
      loggedInAt: new Date(),
    })
  },
})
