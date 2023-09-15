import type { QueryParams } from '@sanity/client'

/**
 * @internal
 */
export type QueryCacheKey = `${string}-${string}`
/**
 * @internal
 */
export function getQueryCacheKey(
  query: string,
  params: QueryParams,
): QueryCacheKey {
  return `${query}-${JSON.stringify(params)}`
}

/**
 * Default tag to use, makes it easier to debug Content Lake requests
 */
export const DEFAULT_TAG = 'sanity.groq-store'
