import type {
  ClientPerspective,
  ContentSourceMap,
  QueryParams,
} from '@sanity/client'
import type {
  CreateQueryStoreOptions as CoreCreateQueryStoreOptions,
  EnableLiveModeOptions,
} from '@sanity/core-loader'
import type { Ref } from 'vue'

/** @public */
export type CreateQueryStoreOptions = Omit<
  CoreCreateQueryStoreOptions,
  'ssr'
> & {
  client: Exclude<CoreCreateQueryStoreOptions['client'], false>
}

/** @public */
export interface UseQueryOptions {
  perspective?: ClientPerspective
}

/** @public */
export type UseQueryComposable = <
  QueryResponseResult = unknown,
  QueryResponseError = unknown,
>(
  key: string,
  query: string,
  params?: QueryParams,
  options?: UseQueryOptions,
) => Promise<{
  data: Ref<QueryResponseResult | undefined>
  sourceMap: Ref<ContentSourceMap | undefined>
  loading: Ref<boolean>
  error: Ref<QueryResponseError | null>
}>

/** @public */
export type UseLiveModeComposable = (
  options: EnableLiveModeOptions,
) => () => void

/** @public */
export interface QueryStore {
  useQuery: UseQueryComposable
  useLiveMode: UseLiveModeComposable
}
