import type {QueryParams} from '@sanity/client'
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
    const stega = options.stega ?? unstable__serverClient.instance?.config().stega.enabled ?? false
    const perspective =
      options.perspective || unstable__serverClient.instance?.config().perspective || 'published'

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
    if (perspective === 'previewDrafts') {
      if (!unstable__serverClient.canPreviewDrafts) {
        throw new Error(
          `You cannot use "previewDrafts" unless you set a "token" in the "client" instance you're pasing to "setServerClient".`,
        )
      }
      
      const {result, resultSourceMap} =
        await unstable__serverClient.instance!.fetch<QueryResponseResult>(query, params, {
          filterResponse: false,
          resultSourceMap: 'withKeyArraySelector',
          stega,
          perspective,
          useCdn: false,
          headers,
          tag,
        })
      // @ts-expect-error - update typings
      return resultSourceMap
        ? {data: result, sourceMap: resultSourceMap, perspective}
        : {data: result, perspective}
    }

    const { result, resultSourceMap } =
      await unstable__cache.instance.fetch<QueryResponseResult>(
        JSON.stringify({ query, params, perspective, stega }),
      )
    // @ts-expect-error - update typings
    return resultSourceMap ? {data: result, sourceMap: resultSourceMap} : {data: result}
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
