import type {
  ClientPerspective,
  ContentSourceMap,
  QueryParams,
} from '@sanity/client'
import {
  createQueryStore as createCoreQueryStore,
  EnableLiveModeOptions,
  type QueryStoreState,
} from '@sanity/core-loader'

export type * from '@sanity/core-loader'

export type UseQueryHook = <
  QueryResponseResult = unknown,
  QueryResponseError = unknown,
>(
  query: string,
  params?: QueryParams,
  options?: UseQueryOptions<QueryResponseResult>,
) => QueryStoreState<QueryResponseResult, QueryResponseError>

export interface QueryResponseInitial<QueryResponseResult> {
  data: QueryResponseResult
  sourceMap: ContentSourceMap | undefined
  /**
   * The perspective used to fetch the data, if not provided it'll assume 'published'
   */
  perspective?: ClientPerspective
}

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
  initial?: QueryResponseInitial<QueryResponseResult>
}
export type UseLiveModeHook = (options: EnableLiveModeOptions) => void

export interface QueryStore {
  query: <QueryResponseResult>(
    query: string,
    params?: QueryParams,
    options?: QueryOptions,
  ) => Promise<QueryResponseInitial<QueryResponseResult>>
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
