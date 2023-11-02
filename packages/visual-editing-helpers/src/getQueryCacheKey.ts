import type { QueryParams } from '@sanity/client'

import { QueryCacheKey } from './types'

/**
 * @internal
 */
export function getQueryCacheKey(
  query: string,
  params: QueryParams | string,
): QueryCacheKey {
  return `${query}-${
    typeof params === 'string' ? params : JSON.stringify(params)
  }`
}
