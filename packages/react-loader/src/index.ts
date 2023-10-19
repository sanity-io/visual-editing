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
) => {
  data?: Response
  sourceMap?: ContentSourceMap
  loading: boolean
  error: any
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
  const useQuery: UseQueryHook = (query, params = DEFAULT_PARAMS) => {
    const $params = useMemo(() => JSON.stringify(params), [params])
    const [snapshot, setSnapshot] = useState(() => initialFetch)
    useEffect(() => {
      const $fetch = createFetcherStore([query, $params])
      const unlisten = $fetch.listen((snapshot) => {
        setSnapshot(snapshot)
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

    useEffect(() => {
      if (store.connected) {
        // eslint-disable-next-line no-console
        console.log('useLiveMode connected')
        return () => {
          // eslint-disable-next-line no-console
          console.log('useLiveMode disconnected')
        }
      }
      return
    }, [store.connected])

    return store
  }

  return { useQuery, useLiveMode }
}
