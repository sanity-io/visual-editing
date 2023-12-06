import {
  QueryParams,
  UseQueryOptions,
  createQueryStore,
  useEncodeDataAttribute,
} from '@sanity/react-loader'
import { workspaces, studioUrl as baseUrl } from 'apps-common/env'

const studioUrl = `${baseUrl}/${workspaces['next-app-router']}`

const {
  useQuery: _useQuery,
  useLiveMode,
  ...serverOnly
} = createQueryStore({
  client: false,
  ssr: true,
})

/**
 * Exports to be used in client-only or components that render both server and client
 */
export { useLiveMode }
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

/**
 * Exports for `sanity.ssr.ts`
 */
export { serverOnly }
