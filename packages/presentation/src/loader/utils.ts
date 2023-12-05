import type { ClientPerspective, QueryParams } from '@sanity/client'
import { useMemo } from 'react'

/**
 * @internal
 */
export type QueryCacheKey = `${ClientPerspective}-${string}-${string}`
/**
 * @internal
 */
export function getQueryCacheKey(
  perspective: ClientPerspective,
  query: string,
  params: QueryParams,
): QueryCacheKey {
  return `${perspective}-${query}-${JSON.stringify(params)}`
}
