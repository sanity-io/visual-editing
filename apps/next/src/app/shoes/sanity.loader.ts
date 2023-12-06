import {
  QueryParams,
  UseQueryOptions,
  useQuery as _useQuery,
  useEncodeDataAttribute,
} from '@sanity/react-loader'
import { workspaces, studioUrl as baseUrl } from 'apps-common/env'

const studioUrl = `${baseUrl}/${workspaces['next-app-router']}`

/**
 * Exports to be used in client-only or components that render both server and client
 */
export const useQuery = <
  QueryResponseResult = unknown,
  QueryResponseError = unknown,
>(
  query: string,
  params?: QueryParams,
  options?: UseQueryOptions<QueryResponseResult>,
) => {
  const snapshot = _useQuery<QueryResponseResult, QueryResponseError>(
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
