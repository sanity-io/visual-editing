import {
  createQueryStore,
  useEncodeDataAttribute,
  type UseQueryOptions,
} from '@sanity/nuxt-loader'
import { getClient } from '@/utils'
import type { QueryParams } from 'sanity'
import { studioUrl } from 'apps-common/env'

const client = getClient()

const { useQuery: _useQuery, useLiveMode } = createQueryStore({ client })

const useQuery = async <
  QueryResponseResult = unknown,
  QueryResponseError = unknown,
>(
  key: string,
  query: string,
  params: QueryParams = {},
  options: UseQueryOptions = {},
) => {
  const snapshot = await _useQuery<QueryResponseResult, QueryResponseError>(
    key,
    query,
    params,
    options,
  )

  const encodeDataAttribute = useEncodeDataAttribute(
    snapshot.data,
    snapshot.sourceMap,
    studioUrl,
  )

  return {
    ...snapshot,
    encodeDataAttribute,
  }
}
export { useQuery, useLiveMode }
