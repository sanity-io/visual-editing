import type {
  ClientPerspective,
  ContentSourceMap,
  QueryParams,
  ResponseQueryOptions,
} from '@sanity/client'
import type { ResolveStudioUrl, StudioUrl } from '@sanity/client/csm'
import {
  createQueryStore as createCoreQueryStore,
  type EnableLiveModeOptions,
  type QueryStoreState,
} from '@sanity/core-loader'
import { EncodeDataAttributeFunction } from '@sanity/core-loader/encode-data-attribute'
import type { Readable } from 'svelte/store'

export type * from '@sanity/core-loader'

/** @public */
export type WithEncodeDataAttribute = {
  encodeDataAttribute: EncodeDataAttributeFunction
}

export type UseQuery = <
  QueryResponseResult = unknown,
  QueryResponseError = unknown,
>(
  query: string,
  params?: QueryParams,
  options?: UseQueryOptions<QueryResponseResult>,
) => Readable<
  QueryStoreState<QueryResponseResult, QueryResponseError> &
    WithEncodeDataAttribute
>

/** @public */
export interface QueryResponseInitial<QueryResponseResult> {
  data: QueryResponseResult
  sourceMap: ContentSourceMap | undefined
  /**
   * The perspective used to fetch the data, if not provided it'll assume 'published'
   */
  perspective?: ClientPerspective
  encodeDataAttribute?: EncodeDataAttributeFunction
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

/** @public */
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

/** @public */
export type NonUndefinedGuard<T> = T extends undefined ? never : T

/** @public */
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

/** @public */
export type UseLiveMode = (
  options?: EnableLiveModeOptions & {
    /**
     * Set this option to activate `encodeDataAttribute` on `useQuery` hooks when stega isn't used.
     */
    studioUrl?: StudioUrl | ResolveStudioUrl | undefined
  },
) => void

/** @public */
export interface QueryStore {
  loadQuery: <QueryResponseResult>(
    query: string,
    params?: QueryParams,
    options?: Pick<ResponseQueryOptions, 'perspective' | 'cache' | 'next'>,
  ) => Promise<QueryResponseInitial<QueryResponseResult>>
  setServerClient: ReturnType<typeof createCoreQueryStore>['setServerClient']
  useQuery: {
    <QueryResponseResult = unknown, QueryResponseError = unknown>(
      query: string,
      params?: QueryParams,
      options?: UseQueryOptionsUndefinedInitial,
    ): Readable<
      QueryStoreState<QueryResponseResult, QueryResponseError> &
        WithEncodeDataAttribute
    >
    <QueryResponseResult = unknown, QueryResponseError = unknown>(
      query: string,
      params?: QueryParams,
      options?: UseQueryOptionsDefinedInitial<QueryResponseResult>,
    ): Readable<
      Omit<QueryStoreState<QueryResponseResult, QueryResponseError>, 'data'> & {
        data: QueryResponseResult
      } & WithEncodeDataAttribute
    >
    // <QueryResponseResult = unknown, QueryResponseError = unknown>(
    //   query: string,
    //   params?: QueryParams,
    //   options?: UseQueryOptions<QueryResponseResult>,
    // ): QueryStoreState<QueryResponseResult, QueryResponseError>
  }
  useLiveMode: UseLiveMode
}
