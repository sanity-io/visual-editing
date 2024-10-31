import type {ClientPerspective, QueryParams} from '@sanity/client'

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

// This is a small hack, perspective=published is returning incorrect results, using it through bundlePerspective works fine.
export function getBundlePerspective(
  perspective: ClientPerspective | `bundle.${string}`,
  bundlesPerspectives: string[],
): string[] {
  if (perspective === 'published') return ['published']
  if (perspective === 'previewDrafts') return ['drafts']
  if (perspective.startsWith('bundle.')) return bundlesPerspectives
  throw new Error(`Invalid perspective: ${perspective}`)
}
