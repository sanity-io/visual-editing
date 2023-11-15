import type { QueryParams } from '@sanity/client'
import {
  createQueryStore as createCoreQueryStore,
  type CreateQueryStoreOptions,
  type QueryStoreState,
} from '@sanity/core-loader'
import { useEffect, useMemo, useState } from 'react'

import { QueryStore, UseLiveModeHook, UseQueryOptions } from './types'

export type * from './types'

export const createQueryStore = (
  options: CreateQueryStoreOptions,
): QueryStore => {
  const { createFetcherStore, enableLiveMode } = createCoreQueryStore(options)
  const DEFAULT_PARAMS = {}
  const useQuery = <QueryResponseResult, QueryResponseError>(
    query: string,
    params: QueryParams = DEFAULT_PARAMS,
    options: UseQueryOptions<QueryResponseResult> = {},
  ) => {
    const [initial] = useState(() =>
      options.initial
        ? { perspective: 'published' as const, ...options.initial }
        : undefined,
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
      const unlisten = fetcher.listen((snapshot) => {
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

  const loadQuery: QueryStore['loadQuery'] = () => {
    throw new Error('The `loadQuery` function is server only.')
  }

  const setServerClient: QueryStore['setServerClient'] = () => {
    throw new Error('The `setServerClient` function is server only.')
  }

  return {
    loadQuery,
    useQuery,
    setServerClient,
    useLiveMode,
  }
}

export * from '../useEncodeDataAttribute'
