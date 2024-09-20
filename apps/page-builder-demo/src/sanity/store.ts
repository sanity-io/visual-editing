import {workspaces} from '@repo/env'
import {studioUrl as baseUrl} from '@repo/studio-url'
import {QueryParams} from '@sanity/client'
import {
  useQuery as _useQuery,
  setServerClient,
  type UseQueryOptionsDefinedInitial,
} from '@sanity/react-loader'
import {SanityNodeContext, wrapData} from '@sanity/react-loader/jsx'
import {useMemo} from 'react'
import {getClient} from './client'

export {loadQuery, useLiveMode} from '@sanity/react-loader'

const {workspace, tool} = workspaces['page-builder-demo']

export const client = getClient()

const token = process.env.SANITY_API_READ_TOKEN

if (typeof document === 'undefined') {
  setServerClient(client.withConfig({token}))
}

const context: SanityNodeContext = {
  baseUrl,
  workspace,
  tool,
}

const DEFAULT_PARAMS = {}

export function useQuery<T>(
  query: string,
  params: QueryParams = DEFAULT_PARAMS,
  options: UseQueryOptionsDefinedInitial<T>,
) {
  const {
    data: rawData,
    error,
    loading,
    sourceMap,
    encodeDataAttribute,
  } = _useQuery<T>(query, params, options)

  const data = useMemo(
    () => (loading || error ? undefined : wrapData(context, rawData, sourceMap)),
    [error, loading, rawData, sourceMap],
  )

  return {
    data,
    error,
    loading,
    sourceMap,
    encodeDataAttribute,
  }
}