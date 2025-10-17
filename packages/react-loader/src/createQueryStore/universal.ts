import type {ContentSourceMap, QueryParams} from '@sanity/client'
import {
  createQueryStore as createCoreQueryStore,
  type CreateQueryStoreOptions,
} from '@sanity/core-loader'
import {defineStudioUrlStore} from '../defineStudioUrlStore'
import {defineUseLiveMode} from '../defineUseLiveMode'
import {defineUseQuery} from '../defineUseQuery'
import type {
  NonUndefinedGuard,
  QueryResponseInitial,
  QueryStore,
  UseLiveModeHook,
  UseQueryOptionsDefinedInitial,
  UseQueryOptionsUndefinedInitial,
} from '../types'

export type * from '../types'

export const createQueryStore = (options: CreateQueryStoreOptions): QueryStore => {
  const {
    createFetcherStore,
    setServerClient,
    enableLiveMode,
    unstable__cache,
    unstable__serverClient,
  } = createCoreQueryStore({tag: 'react-loader', ...options})
  const studioUrlStore = defineStudioUrlStore(options.client)
  const useQuery = defineUseQuery({createFetcherStore, studioUrlStore})
  const useLiveMode: UseLiveModeHook = defineUseLiveMode({
    enableLiveMode,
    setStudioUrl: studioUrlStore.setStudioUrl,
  })

  const loadQuery = async <QueryResponseResult>(
    query: string,
    params: QueryParams = {},
    options: Parameters<QueryStore['loadQuery']>[2] = {},
  ): Promise<QueryResponseInitial<QueryResponseResult>> => {
    const {headers, tag} = options
    const stega =
      typeof options.stega === 'boolean'
        ? options.stega
        : (options.stega?.enabled ??
          unstable__serverClient.instance?.config().stega?.enabled ??
          false)
    const perspective =
      options.perspective || unstable__serverClient.instance?.config().perspective || 'published'
    const useCdn = options.useCdn || unstable__serverClient.instance?.config().useCdn || false

    // Parse decideParameters once, consistently for all code paths
    let parsedDecideParameters: Record<string, string | number> | undefined = undefined
    if (options.decideParameters && options.decideParameters.trim()) {
      try {
        parsedDecideParameters = JSON.parse(options.decideParameters)
      } catch {
        // Failed to parse decideParameters
      }
    }

    if (typeof document !== 'undefined') {
      throw new Error(
        'Cannot use `loadQuery` in a browser environment, you should use it inside a loader, getStaticProps, getServerSideProps, getInitialProps, or in a React Server Component.',
      )
    }
    if (perspective !== 'published' && !unstable__serverClient.instance) {
      throw new Error(
        `You cannot use other perspectives than "published" unless you set "ssr: true" and call "setServerClient" first.`,
      )
    }
    if (Array.isArray(perspective) || perspective === 'drafts' || perspective === 'previewDrafts') {
      if (!unstable__serverClient.canPreviewDrafts) {
        throw new Error(
          `You cannot use 'perspective: ${JSON.stringify(perspective)}' unless you set a "token" in the "client" instance you're pasing to "setServerClient".`,
        )
      }

      const response = await unstable__serverClient.instance!.fetch<QueryResponseResult>(query, params, {
        filterResponse: false,
        resultSourceMap: 'withKeyArraySelector',
        stega,
        perspective,
        decideParameters: parsedDecideParameters,
        useCdn: false,
        headers,
        tag,
      })

      // Type assertion for RawQueryResponse when filterResponse is false
      const {result, resultSourceMap} = response as {result: QueryResponseResult; resultSourceMap?: ContentSourceMap}

      return resultSourceMap
        ? {data: result, sourceMap: resultSourceMap, perspective, decideParameters: options.decideParameters}
        : // @ts-expect-error - update typings
          {data: result, perspective, decideParameters: options.decideParameters}
    }

    const cacheKey = JSON.stringify({query, params, perspective, decideParameters: options.decideParameters, useCdn, stega})

    const {result, resultSourceMap} = await unstable__cache.instance.fetch<QueryResponseResult>(cacheKey)

    // @ts-expect-error - update typings
    return resultSourceMap ? {data: result, sourceMap: resultSourceMap, decideParameters: options.decideParameters} : {data: result, decideParameters: options.decideParameters}
  }

  return {
    loadQuery,
    // @ts-expect-error - update typings
    useQuery,
    setServerClient,
    useLiveMode,
  }
}

export type {
  NonUndefinedGuard,
  QueryResponseInitial,
  QueryStore,
  UseLiveModeHook,
  UseQueryOptionsDefinedInitial,
  UseQueryOptionsUndefinedInitial,
}

/**
 * Shortcut setup for the main SSR use-case.
 * @public
 */
export const {loadQuery, setServerClient, useLiveMode, useQuery} = createQueryStore({
  client: false,
  ssr: true,
})
