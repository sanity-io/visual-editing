import type { ContentSourceMap, QueryParams } from '@sanity/client'
import {
  createQueryStore as createCoreQueryStore,
  type CreateQueryStoreOptions,
  type LiveModeState,
} from '@sanity/core-loader'
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react'

export type * from '@sanity/core-loader'

export type UseQueryHook = <Response>(
  query: string,
  params?: QueryParams,
  options?: UseQueryOptions<Response>,
) => {
  data?: Response
  sourceMap?: ContentSourceMap
  loading: boolean
  error: any
}
export interface UseQueryOptions<Response> {
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
  useQuery: <Response>(
    query: string,
    params?: any,
  ) => {
    data?: Response
    sourceMap?: ContentSourceMap
    loading: boolean
    error: any
  }
  useLiveMode: () => void
} => {
  const { createFetcherStore, $LiveMode } = createCoreQueryStore(options)
  const initialFetch = { loading: true }
  const initialLiveMode = $LiveMode.value!

  const DEFAULT_PARAMS = {}
  const useQuery: UseQueryHook = (
    query,
    params = DEFAULT_PARAMS,
    options = {},
  ) => {
    const { initialData, initialSourceMap } = options
    const $params = useMemo(() => JSON.stringify(params), [params])
    const [snapshot, setSnapshot] = useState(() => ({
      ...initialFetch,
      data:
        initialData || initialSourceMap
          ? { result: initialData, sourceMap: initialSourceMap }
          : undefined,
    }))
    useEffect(() => {
      const $fetch = createFetcherStore([query, $params])
      const unlisten = $fetch.listen((snapshot) => {
        setSnapshot((prev) => ({ ...prev, snapshot }))
      })
      return () => unlisten()
    }, [$params, query])
    // @ts-expect-error -- @TODO fix
    const { data, loading, error } = snapshot
    return {
      data: (data as any)?.result,
      sourceMap: (data as any)?.resultSourceMap,
      loading,
      error,
    }
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
