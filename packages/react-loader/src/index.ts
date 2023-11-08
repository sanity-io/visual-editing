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

export type UseQueryHook = <
  QueryResponseResult = unknown,
  QueryResponseError = unknown,
>(
  query: string,
  params?: QueryParams,
  options?: UseQueryOptions<QueryResponseResult>,
) => QueryStoreState<QueryResponseResult, QueryResponseError>
export interface UseQueryOptions<QueryResponseResult = unknown> {
  /**
   * Initial `data` and `sourceMap`, used with SSR hydration and is required if `ssr: true`
   * and an optional speed optimization if `ssr: false`.
   * It's recommended to set `initial` to the return value of `query()`.
   * @example
   * ```ts
   * const queryAuthor = `*[_type == "author" && slug.current == $slug][0]`
   * export const getServerSideProps = async ({params}) => {
   *   const initial = await query<AuhthorType>(queryAuthor, params)
   *   return { props: { params, initial } }
   * }
   * export default function Page({params, initial}) {
   *   const {data} = useQuery<AuthorType>(queryAuthor, params, {initial})
   * }
   * ```
   */
  initial?: {
    data: QueryResponseResult
    sourceMap: ContentSourceMap | undefined
  }
  startTransition?: TransitionFunction
}
export type UseLiveModeHook = (options: EnableLiveModeOptions) => void

export interface QueryStore {
  query: <QueryResponseResult>(
    query: string,
    params?: QueryParams,
  ) => Promise<{
    data: QueryResponseResult
    sourceMap: ContentSourceMap | undefined
  }>
  setServerClient: ReturnType<typeof createCoreQueryStore>['setServerClient']
  useQuery: UseQueryHook
  useLiveMode: UseLiveModeHook
}

export const createQueryStore = (
  options: CreateQueryStoreOptions,
): QueryStore => {
  const {
    createFetcherStore,
    setServerClient,
    enableLiveMode,
    unstable__cache,
  } = createCoreQueryStore(options)
  const initialFetch = {
    loading: true,
    data: undefined,
    error: undefined,
    sourceMap: undefined,
  } satisfies QueryStoreState<undefined, undefined>

  const DEFAULT_PARAMS = {}
  const useQuery = <QueryResponseResult, QueryResponseError>(
    query: string,
    params: QueryParams = DEFAULT_PARAMS,
    options: UseQueryOptions<QueryResponseResult> = {},
  ) => {
    const { startTransition = _startTransition } = options
    const [initial] = useState(() => options.initial)
    const $params = useMemo(() => JSON.stringify(params), [params])
    const [snapshot, setSnapshot] = useState<
      QueryStoreState<QueryResponseResult, QueryResponseError>
    >(() => ({
      ...initialFetch,
      loading: initial?.data === undefined || initial?.sourceMap === undefined,
      data: initial?.data,
      sourceMap: initial?.sourceMap,
    }))
    useEffect(() => {
      const fetcher = createFetcherStore<
        QueryResponseResult,
        QueryResponseError
      >(query, JSON.parse($params), initial)
      const unlisten = fetcher.listen((snapshot) =>
        startTransition(() => setSnapshot(snapshot)),
      )
      return () => unlisten()
    }, [$params, initial, query, startTransition])
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
  const query = async <QueryResponseResult>(
    query: string,
    params: QueryParams = {},
  ): Promise<{
    data: QueryResponseResult
    sourceMap: ContentSourceMap | undefined
  }> => {
    if (typeof document !== 'undefined') {
      throw new Error(
        'Cannot use `query` in a browser environment, you should use it inside a loader, getStaticProps, getServerSideProps, getInitialProps, or in a React Server Component.',
      )
    }
    const { result, resultSourceMap } =
      await unstable__cache.fetch<QueryResponseResult>(
        JSON.stringify({ query, params }),
      )
    return { data: result, sourceMap: resultSourceMap }
  }

  return { query, useQuery, setServerClient, useLiveMode }
}
