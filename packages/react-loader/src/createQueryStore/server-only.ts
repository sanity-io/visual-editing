import type {ClientPerspective, ContentSourceMap, QueryParams} from '@sanity/client'
import {
  createQueryStore as createCoreQueryStore,
  type CreateQueryStoreOptions,
} from '@sanity/core-loader'
import type {QueryStore as BaseQueryStore, QueryStore} from '../types'

export type * from '../types'

export const createQueryStore = (options: CreateQueryStoreOptions): QueryStore => {
  if (!options.ssr) {
    throw new Error('When using React Server Components the `ssr` option must be set to `true`.')
  }
  const {setServerClient, unstable__serverClient} = createCoreQueryStore({
    tag: 'react-loader.rsc',
    ...options,
  })
  const loadQuery = async <QueryResponseResult>(
    query: string,
    params: QueryParams = {},
    _options: Parameters<QueryStore['loadQuery']>[2] = {},
  ): Promise<{
    data: QueryResponseResult
    sourceMap: ContentSourceMap | undefined
    perspective?: ClientPerspective
  }> => {
    const {cache, next, stega, headers, tag, decideParameters} = _options
    const perspective =
      _options.perspective || unstable__serverClient.instance?.config().perspective || 'published'
    const useCdn = _options.useCdn || unstable__serverClient.instance!.config().useCdn

    const previewPerspective =
      Array.isArray(perspective) || perspective === 'drafts' || perspective === 'previewDrafts'
    if (previewPerspective && !unstable__serverClient.canPreviewDrafts) {
      throw new Error(
        `You cannot use 'perspective: ${JSON.stringify(perspective)}' unless you set a "token" in the "client" instance you're pasing to "setServerClient".`,
      )
    }

    let parsedDecideParameters = undefined
    if (decideParameters && decideParameters.trim()) {
      try {
        parsedDecideParameters = JSON.parse(decideParameters)
      } catch (error) {
        console.error('[DECIDE] react-loader JSON parse FAILED:', decideParameters, error)
      }
    }


    const {result, resultSourceMap} =
      await unstable__serverClient.instance!.fetch<QueryResponseResult>(query, params, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cache: (cache ?? next) ? undefined : ('no-store' as any),
        filterResponse: false,
        next,
        perspective,
        decideParameters: parsedDecideParameters,
        useCdn: previewPerspective ? false : useCdn,
        stega,
        headers,
        tag,
      })
    const payload = resultSourceMap ? {data: result, sourceMap: resultSourceMap} : {data: result}
    if (previewPerspective) {
      // @ts-expect-error - update typings
      return {...payload, perspective}
    }
    // @ts-expect-error - update typings
    return payload
  }

  const useQuery: QueryStore['useQuery'] = () => {
    throw new Error('The `useQuery` hook can only be called from a client component.')
  }

  const useLiveMode: QueryStore['useLiveMode'] = () => {
    throw new Error('The `useLiveMode` hook can only be called from a client component.')
  }

  return {
    loadQuery,
    setServerClient,
    useQuery,
    useLiveMode,
  }
}

export const useEncodeDataAttribute = (): void => {
  throw new Error('The `useEncodeDataAttribute` hook can only be called from a client component.')
}

/**
 * Shortcut setup for the main SSR use-case.
 * @public
 */
export const {loadQuery, setServerClient, useLiveMode, useQuery} = createQueryStore({
  client: false,
  ssr: true,
})

export type {BaseQueryStore}
