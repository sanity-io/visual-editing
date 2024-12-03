import type {ClientPerspective, QueryParams} from '@sanity/client'

/**
 * @internal
 */
export type QueryCacheKey = `${string}-${string}-${string}`
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
