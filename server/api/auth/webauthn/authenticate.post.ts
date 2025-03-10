import type { VerifiedAuthenticationResponse } from '@simplewebauthn/server'
import type { AuthenticatorTransportFuture } from '@simplewebauthn/types'
import type { H3Event } from 'h3'
import type { WebAuthnCredential } from '~/server/types/webauthn'
import { eq } from 'drizzle-orm'
import { neptun_user } from '~/lib/types/database.tables/schema'
import { readUserUsingPrimaryEmail } from '~/server/database/repositories/users'
import { getAndDeleteWebAuthnChallenge, getWebAuthnCredentialById, getWebAuthnCredentialsByUserId, saveWebAuthnChallenge, updateWebAuthnCredentialCounter } from '~/server/database/repositories/webauthnCredentials'

export default defineWebAuthnAuthenticateEventHandler({
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

  async allowCredentials(event: H3Event, userName: string) {
    if (!userName) {
      return []
    }

    const user = await readUserUsingPrimaryEmail(userName)
    if (!user) {
      return []
    }

    const credentials = await getWebAuthnCredentialsByUserId(user.id)
    return credentials.map(cred => ({
      id: cred.id,
      transports: cred.transports.split(',') as AuthenticatorTransportFuture[],
    }))
  },

  async getCredential(event: H3Event, credentialId: string): Promise<WebAuthnCredential> {
    const credential = await getWebAuthnCredentialById(credentialId)
    if (!credential) {
      throw createError({ statusCode: 400, message: 'Credential not found' })
    }
    return {
      id: credential.id,
      publicKey: credential.public_key,
      counter: credential.counter,
      backedUp: credential.backed_up,
      transports: credential.transports.split(',') as AuthenticatorTransportFuture[],
    }
  },

  async onSuccess(
    event: H3Event,
    {
      credential,
      authenticationInfo,
    }: {
      credential: WebAuthnCredential
      authenticationInfo: NonNullable<VerifiedAuthenticationResponse['authenticationInfo']>
    },
  ) {
    const dbCredential = await getWebAuthnCredentialById(credential.id)
    if (!dbCredential) {
      throw createError({ statusCode: 400, message: 'Credential not found' })
    }

    await updateWebAuthnCredentialCounter(credential.id, authenticationInfo.newCounter)

    const user = await db.query.neptun_user.findFirst({
      where: eq(neptun_user.id, dbCredential.user_id),
      columns: {
        id: true,
        primary_email: true,
      },
    })

    if (!user) {
      throw createError({ statusCode: 400, message: 'User not found' })
    }

    await setUserSession(event, {
      user: {
        id: user.id,
        primary_email: user.primary_email,
        webauthn: true,
      },
      loggedInAt: new Date(),
    })
  },
})
