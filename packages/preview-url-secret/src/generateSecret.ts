/* eslint-disable @typescript-eslint/no-non-null-assertion */
/** @internal */
export function generateUrlSecret(): string {
  // Try using WebCrypto if available
  if (typeof crypto !== 'undefined') {
    // Generate a random array of 16 bytes
    const array = new Uint8Array(16)
    crypto.getRandomValues(array)

    // Convert the array to a URL-safe string
    let key = ''
    for (let i = 0; i < array.length; i++) {
      // Convert each byte to a 2-digit hexadecimal number
      key += array[i]!.toString(16).padStart(2, '0')
    }

    // Replace '+' and '/' from base64url to '-' and '_'
    key = btoa(key).replace(/\+/g, '-').replace(/\//g, '_').replace(/[=]+$/, '')

    return key
  }
  // If not fallback to Math.random
  return Math.random().toString(36).slice(2)
}
