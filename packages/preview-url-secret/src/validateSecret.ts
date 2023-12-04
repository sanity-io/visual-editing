import { fetchSecretQuery, tag } from './constants'
import type {
  FetchSecretQueryParams,
  FetchSecretQueryResponse,
  SanityClientLike,
} from './types'

/** @internal */
export async function validateSecret(
  client: SanityClientLike,
  secret: string,
): Promise<boolean> {
  // If we're in the Edge Runtime it's usually too quick and we need to delay fetching the secret a little bit
  // @ts-expect-error -- this global exists if we're in the Edge Runtime
  if (typeof EdgeRuntime !== 'undefined') {
    await new Promise((resolve) => setTimeout(resolve, 300))
  }
  if (!secret || !secret.trim()) {
    return false
  }
  const result = await client.fetch<FetchSecretQueryResponse>(
    fetchSecretQuery,
    { secret } satisfies FetchSecretQueryParams,
    {
      tag,
      // @ts-expect-error -- the `cache` option is valid, but not in the types when NextJS typings aren't installed
      cache: 'no-store',
    },
  )
  if (!result?._id || !result?._updatedAt || !result?.secret) {
    return false
  }
  return secret === result.secret
}
