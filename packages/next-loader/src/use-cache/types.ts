import {
  type ClientPerspective,
  type ClientReturn,
  type ContentSourceMap,
  type QueryParams,
} from '@sanity/client'

/**
 * @alpha
 */
export type SanityCachedFetchOptions<QueryString extends string> = {
  query: QueryString
  params?: QueryParams
  stega: boolean
  perspective: Exclude<ClientPerspective, 'raw'>
  tag: string | undefined
  projectId: string
  dataset: string
  apiVersion: string
  apiHost: string | undefined
  stegaStudioUrl: string | undefined
  productionToken: string | undefined
  previewServerToken: string | undefined
}

/**
 * @alpha
 */
export type SanityCachedFetchReturns<QueryString extends string> = Promise<{
  data: ClientReturn<QueryString>
  sourceMap: ContentSourceMap | null
  tags: string[]
}>

/**
 * @alpha
 */
export type SanityCachedFetch = <const QueryString extends string>(
  options: SanityCachedFetchOptions<QueryString>,
) => SanityCachedFetchReturns<QueryString>
