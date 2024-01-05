import type { QueryParams } from '@sanity/client'
import {
  createQueryStore as createCoreQueryStore,
  type CreateQueryStoreOptions,
} from '@sanity/core-loader'

import type {
  QueryResponseInitial,
  QueryStore,
  UseLiveMode,
  UseQuery,
  UseQueryOptions,
} from './types'

export const createQueryStore = (
  options: CreateQueryStoreOptions,
): QueryStore => {
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
  const DEFAULT_PARAMS = {}

  const useQuery: UseQuery = <QueryResponseResult, QueryResponseError>(
    query: string,
    params: QueryParams = DEFAULT_PARAMS,
    options: UseQueryOptions<QueryResponseResult> = {},
  ) => {
    const initial = options.initial
      ? { perspective: 'published' as const, ...options.initial }
      : undefined

    const $params = JSON.stringify(params)

    const snapshot = createFetcherStore<
      QueryResponseResult,
      QueryResponseError
    >(query, JSON.parse($params), initial)

    return snapshot
  }

  const useLiveMode: UseLiveMode = ({
    allowStudioOrigin,
    client,
    onConnect,
    onDisconnect,
  }) => {
    if (allowStudioOrigin) {
      // eslint-disable-next-line no-console
      console.warn('`allowStudioOrigin` is deprecated and no longer needed')
    }
    const disableLiveMode = enableLiveMode({
      client,
      onConnect,
      onDisconnect,
    })
    return () => disableLiveMode()
  }

  const loadQuery = async <QueryResponseResult>(
    query: string,
    params: QueryParams = {},
    options: Parameters<QueryStore['loadQuery']>[2] = {},
  ): Promise<QueryResponseInitial<QueryResponseResult>> => {
    const { perspective = 'published' } = options
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
      const { result, resultSourceMap } =
        await unstable__serverClient.instance!.fetch<QueryResponseResult>(
          query,
          params,
          {
            filterResponse: false,
            resultSourceMap: 'withKeyArraySelector',
            perspective,
            useCdn: false,
          },
        )
      return { data: result, sourceMap: resultSourceMap, perspective }
    }

    const { result, resultSourceMap } =
      await unstable__cache.fetch<QueryResponseResult>(
        JSON.stringify({ query, params }),
      )
    // @ts-expect-error - update typings
    return resultSourceMap
      ? { data: result, sourceMap: resultSourceMap }
      : { data: result }
  }

  return {
    loadQuery,
    // @ts-expect-error - update typings
    useQuery,
    setServerClient,
    useLiveMode,
  }
}
