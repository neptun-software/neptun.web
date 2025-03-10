import type { AuthenticatorTransportFuture } from '@simplewebauthn/types'

export interface WebAuthnCredential {
  id: string
  publicKey: string
  counter: number
  backedUp: boolean
  transports?: AuthenticatorTransportFuture[]
}

export interface WebAuthnUser {
  userName: string
  [key: string]: unknown
}
