/**
 * Convert text to base64 encoding
 */
export function textToBase64(text: string): string {
  if (typeof window !== 'undefined') {
    return window.btoa(text)
  }
  return Buffer.from(text).toString('base64')
}

/**
 * Convert base64 to text
 */
export function base64ToText(base64: string): string {
  if (typeof window !== 'undefined') {
    return window.atob(base64)
  }
  return Buffer.from(base64, 'base64').toString()
}
