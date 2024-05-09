import {QueryParams} from '@sanity/client'
import {SanityNodeContext, wrapData} from '@sanity/react-loader/jsx'
import {
  setServerClient,
  useQuery as _useQuery,
  type UseQueryOptionsDefinedInitial,
} from '@sanity/react-loader'
import {studioUrl, workspaces} from 'apps-common/env'
import {getClient} from './client'
import {useMemo} from 'react'
import * as React from 'react'

export {loadQuery, useLiveMode} from '@sanity/react-loader'

const workspace = workspaces['page-builder-demo']

export const client = getClient()

const token = process.env.SANITY_API_READ_TOKEN

if (typeof document === 'undefined') {
  setServerClient(client.withConfig({token}))

  if (token) {
    React.experimental_taintUniqueValue?.(
      'Do not pass the sanity API read token to the client.',
      process,
      token,
    )
  }
}

const context: SanityNodeContext = {
  baseUrl: `${studioUrl}/${workspace.workspace}`,
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
