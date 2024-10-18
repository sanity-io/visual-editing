import {apiVersion} from './constants'
import type {SanityClientLike} from './types'

/**
 * Validates the passed in client instance, then clones it and reconfigures it to fit the needs and spec of
 * this package.
 * @internal
 */
export function createClientWithConfig(client: SanityClientLike): SanityClientLike {
  if (!client) {
    throw new TypeError('`client` is required')
  }

  if (!client.config().token) {
    throw new TypeError('`client` must have a `token` specified')
  }

  return client.withConfig({
    perspective: 'raw',
    // Userland might be using an API version that's too old to use perspectives
    apiVersion,
    // We can't use the CDN, the secret is typically validated right after it's created
    useCdn: false,
    // Don't waste time returning a source map, we don't need it
    resultSourceMap: false,
    // @ts-expect-error - If stega is enabled, make sure it's disabled
    stega: false,
  })
}
