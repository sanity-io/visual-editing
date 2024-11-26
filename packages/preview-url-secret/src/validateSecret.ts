import {fetchSecretQuery, fetchSharedAccessSecretQuery, tag} from './constants'
import type {
  FetchPublicSecretQueryResponse,
  FetchSecretQueryParams,
  FetchSecretQueryResponse,
  SanityClientLike,
} from './types'

export type {SanityClientLike}

/** @public */
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
  const {private: privateSecret, public: publicSecret} = await client.fetch<
    {
      private: FetchSecretQueryResponse
      public: FetchPublicSecretQueryResponse
    },
    FetchSecretQueryParams
  >(
    `{
      "private": ${fetchSecretQuery},
      "public": ${fetchSharedAccessSecretQuery}
    }`,
    {secret: secret},
    {
      tag,
      // In CloudFlare Workers we can't pass the cache header
      ...(!disableCacheNoStore ? {cache: 'no-store'} : undefined),
    },
  )
  if (privateSecret) {
    if (!privateSecret?._id || !privateSecret?._updatedAt || !privateSecret?.secret) {
      return {isValid: false, studioUrl: null}
    }
    return {isValid: secret === privateSecret.secret, studioUrl: privateSecret.studioUrl}
  }
  if (!publicSecret?.secret) {
    return {isValid: false, studioUrl: null}
  }
  return {isValid: secret === publicSecret.secret, studioUrl: publicSecret.studioUrl}
}
