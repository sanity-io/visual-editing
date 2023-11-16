import { apiVersion } from './constants'
import { SanityClientLike } from './types'

/**
 * Validates the passed in client instance, then clones it and reconfigures it to fit the needs and spec of
 * this package.
 * @internal
 */
export function createClientWithConfig(
  client: SanityClientLike,
): SanityClientLike {
  if (!client) {
    throw new TypeError('`client` is required')
  }

  if (!client.config().token) {
    throw new TypeError('`client` must have a `token` specified')
  }

  return client.withConfig({
    // Userland might be using an API version that's too old to use perspectives
    apiVersion,
    // We can't use the CDN, the secret is typically validated rigth after it's created
    useCdn: false,
    // The documents that hold secrets are never drafts
    perspective: 'published',
    // Don't waste time returning a source map, we don't need it
    resultSourceMap: false,
    // @ts-expect-error - If stega is enabled, make sure it's disabled
    stega: false,
  })
}
