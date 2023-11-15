import { QueryParams } from '@sanity/client'
import {
  createQueryStore as createCoreQueryStore,
  type CreateQueryStoreOptions,
  type MapStore,
  QueryStoreState,
} from '@sanity/core-loader'

export const createQueryStore = (
  options: CreateQueryStoreOptions,
): {
  loadQuery: <QueryResponseResult = unknown, QueryResponseError = unknown>(
    query: string,
    params?: QueryParams,
  ) => MapStore<QueryStoreState<QueryResponseResult, QueryResponseError>>
  enableLiveMode: ReturnType<typeof createCoreQueryStore>['enableLiveMode']
} => {
  const { createFetcherStore, enableLiveMode } = createCoreQueryStore(options)
  const loadQuery = (query: string, params: QueryParams = {}) =>
    createFetcherStore(query, params)
  // @ts-expect-error -- @TODO fix
  return { loadQuery, enableLiveMode }
}
