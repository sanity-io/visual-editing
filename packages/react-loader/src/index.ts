import type { ContentSourceMap, QueryParams } from '@sanity/client'
import {
  createQueryStore as createCoreQueryStore,
  type CreateQueryStoreOptions,
  EnableLiveModeOptions,
  type QueryStoreState,
} from '@sanity/core-loader'
import {
  startTransition as _startTransition,
  type TransitionFunction,
  useEffect,
  useMemo,
  useState,
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
  startTransition?: TransitionFunction
}
export type UseLiveModeHook = (options: EnableLiveModeOptions) => void

export interface QueryStore {
  query: <Response>(
    query: string,
    params?: QueryParams,
  ) => Promise<{ data: Response; sourceMap: ContentSourceMap | undefined }>
  useQuery: UseQueryHook
  useLiveMode: UseLiveModeHook
}

export const createQueryStore = (
  options: CreateQueryStoreOptions,
): QueryStore => {
  const { createFetcherStore, enableLiveMode, unstable__cache } =
    createCoreQueryStore(options)
  const initialFetch = {
    loading: true,
    data: undefined,
    error: undefined,
    sourceMap: undefined,
  } satisfies QueryStoreState<Response, Error>

  const DEFAULT_PARAMS = {}
  const useQuery = <Response, Error>(
    query: string,
    params: QueryParams = DEFAULT_PARAMS,
    options: UseQueryOptions<Response> = {},
  ) => {
    const {
      initialData: _initialData,
      initialSourceMap: _initialSourceMap,
      startTransition = _startTransition,
    } = options
    const [initialData] = useState(() => _initialData)
    const [initialSourceMap] = useState(() => _initialSourceMap)
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
        initialData,
        initialSourceMap,
      )
      const unlisten = fetcher.listen((snapshot) =>
        startTransition(() => setSnapshot(snapshot)),
      )
      return () => unlisten()
    }, [$params, initialData, initialSourceMap, query, startTransition])
    return snapshot
  }

  const useLiveMode: UseLiveModeHook = ({
    allowStudioOrigin,
    onConnect,
    onDisconnect,
  }) => {
    useEffect(() => {
      const disableLiveMode = enableLiveMode({
        allowStudioOrigin,
        onConnect,
        onDisconnect,
      })
      return () => disableLiveMode()
    }, [allowStudioOrigin, onConnect, onDisconnect])
  }
  const query = async <Response>(
    query: string,
    params: QueryParams = {},
  ): Promise<{ data: Response; sourceMap: ContentSourceMap | undefined }> => {
    if (typeof document !== 'undefined') {
      throw new Error(
        'Cannot use `query` in a browser environment, you should use it inside a loader, getStaticProps, getServerSideProps, getInitialProps, or in a React Server Component.',
      )
    }
    const { result, resultSourceMap } = await unstable__cache.fetch<Response>(
      JSON.stringify({ query, params }),
    )
    return { data: result, sourceMap: resultSourceMap }
  }

  return { query, useQuery, useLiveMode }
}
