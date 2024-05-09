import {fetchSecretQuery, tag} from './constants'
import type {FetchSecretQueryParams, FetchSecretQueryResponse, SanityClientLike} from './types'

/** @internal */
export async function validateSecret(
  client: SanityClientLike,
  secret: string,
  disableCacheNoStore: boolean,
): Promise<{isValid: boolean; studioUrl: string | null}> {
  // If we're in the Edge Runtime it's usually too quick and we need to delay fetching the secret a little bit
  // @ts-expect-error -- this global exists if we're in the Edge Runtime
  if (typeof EdgeRuntime !== 'undefined') {
    await new Promise((resolve) => setTimeout(resolve, 300))
  }
  if (!secret || !secret.trim()) {
    return {isValid: false, studioUrl: null}
  }
  const result = await client.fetch<FetchSecretQueryResponse, FetchSecretQueryParams>(
    fetchSecretQuery,
    {secret: secret},
    {
      tag,
      // In CloudFlare Workers we can't pass the cache header
      ...(!disableCacheNoStore ? {cache: 'no-store'} : undefined),
    },
  )
  if (!result?._id || !result?._updatedAt || !result?.secret) {
    return {isValid: false, studioUrl: null}
  }
  return {isValid: secret === result.secret, studioUrl: result.studioUrl}
}
