import { SanityClient } from '@sanity/client'
import { SanityStegaClient } from '@sanity/client/stega'

/** @internal */
export function isStegaClient(
  client: SanityClient | SanityStegaClient,
): client is SanityStegaClient {
  return client instanceof SanityStegaClient
}
