import {
  createQueryStore as createCoreQueryStore,
  type CreateQueryStoreOptions,
} from '@sanity/core-loader'

import {defineStudioUrlStore} from './defineStudioUrlStore'
import {defineUseLiveMode} from './defineUseLiveMode'
import {defineUseQuery} from './defineUseQuery'
import type {LoadQuery, QueryResponseInitial, QueryStore, UseLiveMode} from './types'

/**
 * Create a query store
 * @public
 */
export const createQueryStore = (options: CreateQueryStoreOptions): QueryStore => {
  const {
    createFetcherStore,
    setServerClient,
    enableLiveMode,
    unstable__cache,
    unstable__serverClient,
  } = createCoreQueryStore({
    tag: 'svelte-loader',
    ...options,
  })

  const studioUrlStore = defineStudioUrlStore(options.client)
  const useQuery = defineUseQuery({createFetcherStore, studioUrlStore})
  const useLiveMode: UseLiveMode = defineUseLiveMode({
    enableLiveMode,
    studioUrlStore,
  })

  const loadQuery: LoadQuery = async <QueryResponseResult>(
    query: Parameters<LoadQuery>[0],
    params: Parameters<LoadQuery>[1] = {},
    options: Parameters<LoadQuery>[2] = {},
  ): Promise<QueryResponseInitial<QueryResponseResult>> => {
    const {headers, tag} = options
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
          `You cannot use "previewDrafts" unless you set a "token" in the "client" instance passed to "setServerClient".`,
        )
      }
      const {result, resultSourceMap} =
        await unstable__serverClient.instance!.fetch<QueryResponseResult>(query, params, {
          filterResponse: false,
          resultSourceMap: 'withKeyArraySelector',
          perspective,
          useCdn: false,
          headers,
          tag,
        })
      return {data: result, sourceMap: resultSourceMap, perspective}
    }

    const useCdn = options.useCdn || unstable__serverClient.instance!.config().useCdn

    const {result, resultSourceMap} = await unstable__cache.instance.fetch<QueryResponseResult>(
      JSON.stringify({query, params, perspective, useCdn}),
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
    unstable__serverClient,
  }
}

/**
 * Shortcut setup for the main SSR use-case.
 * @public
 */
export const {
  /** @public */
  loadQuery,
  /** @public */
  setServerClient,
  /** @public */
  useLiveMode,
  /** @public */
  useQuery,
  /** @internal */
  unstable__serverClient,
} = createQueryStore({
  client: false,
  ssr: true,
})
