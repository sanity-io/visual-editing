import type {
  ClientPerspective,
  ContentSourceMap,
  QueryParams,
} from '@sanity/client'
import {
  createQueryStore as createCoreQueryStore,
  type CreateQueryStoreOptions,
  EnableLiveModeOptions,
  type QueryStoreState,
} from '@sanity/core-loader'
import { useEffect, useMemo, useState } from 'react'

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
    sourceMap?: ContentSourceMap
    /**
     * The perspective used to fetch the data, if not provided it'll assume 'published'
     */
    perspective?: ClientPerspective
  }
}
export type UseLiveModeHook = (options: EnableLiveModeOptions) => void

export interface QueryStore {
  query: <QueryResponseResult>(
    query: string,
    params?: QueryParams,
    options?: { perspective?: ClientPerspective },
  ) => Promise<{
    data: QueryResponseResult
    sourceMap?: ContentSourceMap
    perspective?: ClientPerspective
  }>
  setServerClient: ReturnType<typeof createCoreQueryStore>['setServerClient']
  useQuery: UseQueryHook
  useLiveMode: UseLiveModeHook
}

export interface QueryOptions<T = 'next'> {
  /**
   * The perspective used to fetch the data, if not provided it'll assume 'published'
   */
  perspective?: ClientPerspective
  cache?: RequestInit['cache']
  next?: T extends keyof RequestInit ? RequestInit[T] : never
}

export const createQueryStore = (
  options: CreateQueryStoreOptions,
): QueryStore => {
  const {
    createFetcherStore,
    setServerClient,
    enableLiveMode,
    unstable__cache,
    unstable__serverClient,
  } = createCoreQueryStore(options)
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
  const query = async <QueryResponseResult>(
    query: string,
    params: QueryParams = {},
    options: QueryOptions = {},
  ): Promise<{
    data: QueryResponseResult
    sourceMap?: ContentSourceMap
    perspective?: ClientPerspective
  }> => {
    const { perspective = 'published' } = options
    if (typeof document !== 'undefined') {
      throw new Error(
        'Cannot use `query` in a browser environment, you should use it inside a loader, getStaticProps, getServerSideProps, getInitialProps, or in a React Server Component.',
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
    return resultSourceMap
      ? { data: result, sourceMap: resultSourceMap }
      : { data: result }
  }

  return {
    query,
    useQuery,
    setServerClient,
    useLiveMode,
  }
}

export * from './useEncodeDataAttribute'
