import { QueryParams } from '@sanity/client'
import { SanityNodeContext, wrapData } from '@sanity/react-loader/jsx'
import { createQueryStore } from '@sanity/react-loader'
import { studioUrl, workspaces } from 'apps-common/env'
import { getClient } from './client'
import { useMemo } from 'react'

const workspace = workspaces['page-builder-demo']

export const client = getClient()

const { useQuery: _useQuery, useLiveMode } = createQueryStore({
  client,
  studioUrl,
})

const context: SanityNodeContext = {
  projectId: workspace.projectId,
  dataset: workspace.dataset,
  baseUrl: `${studioUrl}/${workspace.workspace}`,
}

export function useQuery<T>(query: string, params?: QueryParams) {
  const {
    data: rawData,
    error,
    loading,
    sourceMap,
  } = _useQuery<T>(query, params)

  const data = useMemo(
    () =>
      loading || error ? undefined : wrapData(context, rawData, sourceMap),
    [error, loading, rawData, sourceMap],
  )

  return {
    data,
    error,
    loading,
    sourceMap,
  }
}

export { useLiveMode }
