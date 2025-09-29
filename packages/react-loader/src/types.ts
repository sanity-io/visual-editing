import type {
  ClientPerspective,
  ContentSourceMap,
  QueryParams,
  ResponseQueryOptions,
} from '@sanity/client'
import type {ResolveStudioUrl, StudioUrl} from '@sanity/client/csm'
import type {
  createQueryStore as createCoreQueryStore,
  EnableLiveModeOptions,
  QueryStoreState,
} from '@sanity/core-loader'
import type {EncodeDataAttributeFunction} from '@sanity/core-loader/encode-data-attribute'

export type * from '@sanity/core-loader'

type WithEncodeDataAttribute = {
  encodeDataAttribute: EncodeDataAttributeFunction
}

export type UseQueryHook = <QueryResponseResult = unknown, QueryResponseError = unknown>(
  query: string,
  params?: QueryParams,
  options?: UseQueryOptions<QueryResponseResult>,
) => QueryStoreState<QueryResponseResult, QueryResponseError> & WithEncodeDataAttribute

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
   * It's recommended to set `initial` to the return value of `loadQuery()`.
   * @example
   * ```ts
   * const query = `*[_type == "author" && slug.current == $slug][0]`
   * export const getServerSideProps = async ({params}) => {
   *   const initial = await loadQuery<AuhthorType>(query, params)
   *   return { props: { params, initial } }
   * }
   * export default function Page({params, initial}) {
   *   const {data} = useQuery<AuthorType>(query, params, {initial})
   * }
   * ```
   */
  initial?: QueryResponseInitial<QueryResponseResult>
}

export interface UseQueryOptionsUndefinedInitial {
  /**
   * Initial `data` and `sourceMap`, used with SSR hydration and is required if `ssr: true`
   * and an optional speed optimization if `ssr: false`.
   * It's recommended to set `initial` to the return value of `loadQuery()`.
   * @example
   * ```ts
   * const query = `*[_type == "author" && slug.current == $slug][0]`
   * export const getServerSideProps = async ({params}) => {
   *   const initial = await loadQuery<AuhthorType>(query, params)
   *   return { props: { params, initial } }
   * }
   * export default function Page({params, initial}) {
   *   const {data} = useQuery<AuthorType>(query, params, {initial})
   * }
   * ```
   */
  initial?: undefined
}

export type NonUndefinedGuard<T> = T extends undefined ? never : T

export interface UseQueryOptionsDefinedInitial<QueryResponseResult = unknown> {
  /**
   * Initial `data` and `sourceMap`, used with SSR hydration and is required if `ssr: true`
   * and an optional speed optimization if `ssr: false`.
   * It's recommended to set `initial` to the return value of `loadQuery()`.
   * @example
   * ```ts
   * const query = `*[_type == "author" && slug.current == $slug][0]`
   * export const getServerSideProps = async ({params}) => {
   *   const initial = await loadQuery<AuhthorType>(query, params)
   *   return { props: { params, initial } }
   * }
   * export default function Page({params, initial}) {
   *   const {data} = useQuery<AuthorType>(query, params, {initial})
   * }
   * ```
   */
  initial: NonUndefinedGuard<QueryResponseInitial<QueryResponseResult>>
}
export type UseLiveModeHook = (
  options: EnableLiveModeOptions & {
    /**
     * Set this option to activate `encodeDataAttribute` on `useQuery` hooks when stega isn't used.
     */
    studioUrl?: StudioUrl | ResolveStudioUrl | undefined
  },
) => void

export interface QueryStore {
  loadQuery: <QueryResponseResult>(
    query: string,
    params?: QueryParams,
    options?: Pick<
      ResponseQueryOptions,
      'perspective' | 'cache' | 'next' | 'useCdn' | 'stega' | 'tag' | 'headers'
    > & {
      decideParameters?: string
    },
  ) => Promise<QueryResponseInitial<QueryResponseResult>>
  setServerClient: ReturnType<typeof createCoreQueryStore>['setServerClient']
  useQuery: {
    <QueryResponseResult = unknown, QueryResponseError = unknown>(
      query: string,
      params?: QueryParams,
      options?: UseQueryOptionsUndefinedInitial,
    ): QueryStoreState<QueryResponseResult, QueryResponseError> & WithEncodeDataAttribute
    <QueryResponseResult = unknown, QueryResponseError = unknown>(
      query: string,
      params?: QueryParams,
      options?: UseQueryOptionsDefinedInitial<QueryResponseResult>,
    ): Omit<QueryStoreState<QueryResponseResult, QueryResponseError>, 'data'> & {
      data: QueryResponseResult
    } & WithEncodeDataAttribute
    // <QueryResponseResult = unknown, QueryResponseError = unknown>(
    //   query: string,
    //   params?: QueryParams,
    //   options?: UseQueryOptions<QueryResponseResult>,
    // ): QueryStoreState<QueryResponseResult, QueryResponseError> & WithEncodeDataAttribute
  }
  useLiveMode: UseLiveModeHook
}
