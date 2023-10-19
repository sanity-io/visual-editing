import { QueryParams } from '@sanity/client'
import {
  createQueryStore as createCoreQueryStore,
  type CreateQueryStoreOptions,
  type FetcherStore,
  QueryStoreFetcherData,
} from '@sanity/core-loader'

export const createQueryStore = (
  options: CreateQueryStoreOptions,
): {
  query: <Response>(
    query: string,
    params?: QueryParams,
  ) => FetcherStore<QueryStoreFetcherData<Response>, Error>
  liveMode: ReturnType<typeof createCoreQueryStore>['$LiveMode']
} => {
  const { createFetcherStore, $LiveMode } = createCoreQueryStore(options)
  const query = (query: string, params: QueryParams = {}) =>
    createFetcherStore([query, JSON.stringify(params)])
  // @ts-expect-error -- @TODO fix
  return { query, liveMode: $LiveMode }
}
