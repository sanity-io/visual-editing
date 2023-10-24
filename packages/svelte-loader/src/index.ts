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
  query: <Response = unknown, Error = unknown>(
    query: string,
    params?: QueryParams,
  ) => MapStore<QueryStoreState<Response, Error>>
  liveMode: ReturnType<typeof createCoreQueryStore>['$LiveMode']
} => {
  const { createFetcherStore, $LiveMode } = createCoreQueryStore(options)
  const query = (query: string, params: QueryParams = {}) =>
    createFetcherStore(query, params)
  // @ts-expect-error -- @TODO fix
  return { query, liveMode: $LiveMode }
}
