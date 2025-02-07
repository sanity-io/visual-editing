import {createClient, type ClientPerspective} from '@sanity/client'
import type {SanityCachedFetch, SanityCachedFetchOptions, SanityCachedFetchReturns} from './types'

/**
 * @alpha
 */
export const sanityCachedFetch: SanityCachedFetch = async function sanityCachedFetch<
  const QueryString extends string,
>({
  query,
  params,
  stega,
  perspective,
  tag,
  projectId,
  dataset,
  apiVersion,
  apiHost,
  stegaStudioUrl,
  productionToken,
  previewServerToken,
}: SanityCachedFetchOptions<QueryString>): SanityCachedFetchReturns<QueryString> {
  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: true,
    apiHost,
    perspective: 'published',
    token: productionToken,
    stega: {
      studioUrl: stegaStudioUrl,
    },
  })
  const useCdn = perspective === 'published'

  const {result, resultSourceMap, syncTags} = await client.fetch(query, await params, {
    filterResponse: false,
    perspective: perspective as ClientPerspective,
    stega,
    token: perspective !== 'published' && previewServerToken ? previewServerToken : productionToken,
    useCdn,
    cacheMode: useCdn ? 'noStale' : undefined,
    tag,
  })
  const tags = syncTags?.map((tag) => `sanity:${tag}`) || []

  return {data: result, sourceMap: resultSourceMap || null, tags}
}

export {resolveCookiePerspective} from '../resolveCookiePerspective'

export type * from './types'
