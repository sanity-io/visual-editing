import type { ContentSourceMap, QueryParams } from '@sanity/client'
import {
  createQueryStore as createCoreQueryStore,
  type CreateQueryStoreOptions,
  type LiveModeState,
  type QueryStoreState,
} from '@sanity/core-loader'
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react'

export type * from '@sanity/core-loader'

export type UseQueryHook = <Response = unknown, Error = unknown>(
  query: string,
  params?: QueryParams,
  options?: UseQueryOptions<Response>,
) => QueryStoreState<Response, Error>
export interface UseQueryOptions<Response = unknown> {
  initialData?: Response
  initialSourceMap?: ContentSourceMap
}
export type UseLiveModeHook = () => LiveModeState

export interface QueryStore {
  useQuery: UseQueryHook
  useLiveMode: UseLiveModeHook
}

export const createQueryStore = (
  options: CreateQueryStoreOptions,
): {
  useQuery: <Response = unknown, Error = unknown>(
    query: string,
    params?: QueryParams,
    options?: UseQueryOptions<Response>,
  ) => QueryStoreState<Response, Error>
  useLiveMode: () => void
} => {
  const { createFetcherStore, $LiveMode } = createCoreQueryStore(options)
  const initialFetch = {
    loading: true,
    data: undefined,
    error: undefined,
    sourceMap: undefined,
  } satisfies QueryStoreState<Response, Error>
  const initialLiveMode = $LiveMode.value!

  const DEFAULT_PARAMS = {}
  const useQuery = <Response, Error>(
    query: string,
    params: QueryParams = DEFAULT_PARAMS,
    options: UseQueryOptions<Response> = {},
  ) => {
    const { initialData, initialSourceMap } = options
    const $params = useMemo(() => JSON.stringify(params), [params])
    const [snapshot, setSnapshot] = useState<QueryStoreState<Response, Error>>(
      () => ({
        ...initialFetch,
        data: initialData,
        sourceMap: initialSourceMap,
      }),
    )
    useEffect(() => {
      const fetcher = createFetcherStore<Response, Error>(
        query,
        JSON.parse($params),
      )
      const unlisten = fetcher.listen((snapshot) => {
        setSnapshot(snapshot)
      })
      return () => unlisten()
    }, [$params, query])
    return snapshot
  }

  const useLiveMode: UseLiveModeHook = () => {
    const store = useSyncExternalStore(
      useCallback((onStoreChange) => $LiveMode.listen(onStoreChange), []),
      () => $LiveMode.get(),
      () => initialLiveMode,
    )

    return store
  }

  return { useQuery, useLiveMode }
}
