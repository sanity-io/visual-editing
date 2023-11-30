import type { QueryParams } from '@sanity/client'
import {
  createQueryStore as createCoreQueryStore,
  type CreateQueryStoreOptions,
  type QueryStoreState,
} from '@sanity/core-loader'
import { useEffect, useMemo, useState } from 'react'

import {
  QueryResponseInitial,
  QueryStore,
  UseLiveModeHook,
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
  } = createCoreQueryStore({ tag: 'react-loader', ...options })
  const DEFAULT_PARAMS = {}
  const useQuery = <QueryResponseResult, QueryResponseError>(
    query: string,
    params: QueryParams = DEFAULT_PARAMS,
    options: UseQueryOptions<QueryResponseResult> = {},
  ) => {
    const initial = useMemo(
      () =>
        options.initial
          ? { perspective: 'published' as const, ...options.initial }
          : undefined,
      [options.initial],
    )
    const $params = useMemo(() => JSON.stringify(params), [params])

    const [snapshot, setSnapshot] = useState<
      QueryStoreState<QueryResponseResult, QueryResponseError>
    >(() => {
      const fetcher = createFetcherStore<
        QueryResponseResult,
        QueryResponseError
      >(query, JSON.parse($params), initial)
      return fetcher.value!
    })
    useEffect(() => {
      const fetcher = createFetcherStore<
        QueryResponseResult,
        QueryResponseError
      >(query, JSON.parse($params), initial)
      const unlisten = fetcher.subscribe((snapshot) => {
        setSnapshot(snapshot)
      })

      return () => unlisten()
    }, [$params, initial, query])

    return snapshot
  }

  const useLiveMode: UseLiveModeHook = ({
    allowStudioOrigin,
    client,
    onConnect,
    onDisconnect,
  }) => {
    useEffect(() => {
      const disableLiveMode = enableLiveMode({
        allowStudioOrigin,
        client,
        onConnect,
        onDisconnect,
      })
      return () => disableLiveMode()
    }, [allowStudioOrigin, client, onConnect, onDisconnect])
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
      // Necessary with a new client instanec as `useCdn` can't be set on `client.fetch`
      const client = unstable__serverClient.instance!.config().useCdn
        ? unstable__serverClient.instance!.withConfig({ useCdn: false })
        : unstable__serverClient.instance!
      const { result, resultSourceMap } =
        await client!.fetch<QueryResponseResult>(query, params, {
          filterResponse: false,
          resultSourceMap: 'withKeyArraySelector',
          perspective,
        })
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
