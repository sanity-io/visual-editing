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

export type CreateQueryStoreOptions = Omit<
  CoreCreateQueryStoreOptions,
  'ssr'
> & {
  client: Exclude<CoreCreateQueryStoreOptions['client'], false>
}

export interface UseQueryOptions {
  perspective?: ClientPerspective
}

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

export type UseLiveModeComposable = (
  options: EnableLiveModeOptions,
) => () => void

export interface QueryStore {
  useQuery: UseQueryComposable
  useLiveMode: UseLiveModeComposable
}
