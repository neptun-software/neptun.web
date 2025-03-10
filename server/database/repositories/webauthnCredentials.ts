import type {
  ReadWebAuthnCredential,
  WebAuthnCredentialToCreate } from '../../../lib/types/database.tables/schema'
import { and, eq, sql } from 'drizzle-orm'
import {
  neptun_user_webauthn_credential,
  neptun_webauthn_challenge,
} from '../../../lib/types/database.tables/schema'

/**
 * Creates a new WebAuthn credential
 */
export async function createWebAuthnCredential(credential: WebAuthnCredentialToCreate) {
  const newCredential = await db
    .insert(neptun_user_webauthn_credential)
    .values(credential)
    .returning()

  return newCredential[0]
}

/**
 * Gets a WebAuthn credential by ID
 */
export async function getWebAuthnCredentialById(credentialId: string) {
  const credential = await db
    .select()
    .from(neptun_user_webauthn_credential)
    .where(eq(neptun_user_webauthn_credential.id, credentialId))
    .limit(1)

  return credential[0] as ReadWebAuthnCredential | undefined
}

/**
 * Gets all WebAuthn credentials for a user
 */
export async function getWebAuthnCredentialsByUserId(userId: number) {
  const credentials = await db
    .select()
    .from(neptun_user_webauthn_credential)
    .where(eq(neptun_user_webauthn_credential.user_id, userId))

  return credentials as ReadWebAuthnCredential[]
}

/**
 * Updates a WebAuthn credential's counter
 */
export async function updateWebAuthnCredentialCounter(credentialId: string, counter: number) {
  const updatedCredential = await db
    .update(neptun_user_webauthn_credential)
    .set({ counter, updated_at: new Date() })
    .where(eq(neptun_user_webauthn_credential.id, credentialId))
    .returning()

  return updatedCredential[0] as ReadWebAuthnCredential | undefined
}

/**
 * Deletes a WebAuthn credential
 */
export async function deleteWebAuthnCredential(credentialId: string) {
  return db
    .delete(neptun_user_webauthn_credential)
    .where(eq(neptun_user_webauthn_credential.id, credentialId))
    .returning()
}

/**
 * Saves a WebAuthn challenge
 */
export async function saveWebAuthnChallenge(attemptId: string, challenge: string, expiresIn = 15 * 60 * 1000) {
  const expiresAt = new Date(Date.now() + expiresIn) // Default expiration: 15 minutes

  const result = await db
    .insert(neptun_webauthn_challenge)
    .values({
      attempt_id: attemptId,
      challenge,
      expires_at: expiresAt,
    })
    .returning()

  return result[0]
}

/**
 * Gets and deletes a WebAuthn challenge
 */
export async function getAndDeleteWebAuthnChallenge(attemptId: string) {
  // First get the challenge
  const challenge = await db
    .select()
    .from(neptun_webauthn_challenge)
    .where(and(
      eq(neptun_webauthn_challenge.attempt_id, attemptId),
      sql`${neptun_webauthn_challenge.expires_at} > NOW()`,
    ))
    .limit(1)

  if (!challenge[0]) {
    return undefined
  }

  // Then delete it (challenges are single-use)
  await db
    .delete(neptun_webauthn_challenge)
    .where(eq(neptun_webauthn_challenge.attempt_id, attemptId))

  return challenge[0].challenge
}

/**
 * Clean expired challenges (can be called periodically)
 */
export async function cleanExpiredWebAuthnChallenges() {
  return db
    .delete(neptun_webauthn_challenge)
    .where(sql`${neptun_webauthn_challenge.expires_at} <= NOW()`)
}
