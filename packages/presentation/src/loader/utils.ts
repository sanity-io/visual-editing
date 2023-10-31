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

/**
 * Return params that are stable with deep equal as long as the key order is the same
 * @internal
 */
export function useParams(
  params?: undefined | null | QueryParams,
): QueryParams {
  const stringifiedParams = useMemo(
    () => JSON.stringify(params || {}),
    [params],
  )
  return useMemo(
    () => JSON.parse(stringifiedParams) as QueryParams,
    [stringifiedParams],
  )
}
