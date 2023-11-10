import type { SanityClient } from 'sanity'

import { SECRET_TTL, tag, UrlSecretId } from './isValidSecret'
import { generateUrlSecret } from '../src/generateSecret'

export function getExpiresAt(_updatedAt: Date): Date {
  return new Date(_updatedAt.getTime() + 1000 * SECRET_TTL)
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
    .createOrReplace({ _id: urlSecretId, _type: urlSecretId })
    .patch(patch)
    .commit({ tag, signal })
  return newSecret
}
