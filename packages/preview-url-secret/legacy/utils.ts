import type { SanityClient } from 'sanity'

import { SECRET_TTL, tag, UrlSecretId } from './isValidSecret'

export function getExpiresAt(_updatedAt: Date): Date {
  return new Date(_updatedAt.getTime() + 1000 * SECRET_TTL)
}

function generateUrlSecret() {
  // Try using WebCrypto if available
  if (typeof crypto !== 'undefined') {
    // Generate a random array of 16 bytes
    const array = new Uint8Array(16)
    crypto.getRandomValues(array)

    // Convert the array to a URL-safe string
    let key = ''
    for (let i = 0; i < array.length; i++) {
      // Convert each byte to a 2-digit hexadecimal number
      key += array[i].toString(16).padStart(2, '0')
    }

    // Replace '+' and '/' from base64url to '-' and '_'
    key = btoa(key).replace(/\+/g, '-').replace(/\//g, '_').replace(/[=]+$/, '')

    return key
  }
  // If not fallback to Math.random
  return Math.random().toString(36).slice(2)
}

export async function patchUrlSecret(
  client: SanityClient,
  urlSecretId: UrlSecretId,
  signal?: AbortSignal,
): Promise<string> {
  const newSecret = generateUrlSecret()
  const patch = client.patch(urlSecretId).set({ secret: newSecret })
  await client
    .transaction()
    .createIfNotExists({ _id: urlSecretId, _type: urlSecretId })
    .patch(patch)
    .commit({ tag, signal })
  return newSecret
}
