import type { ClientPerspective, QueryParams } from '@sanity/client'
import { ChannelReturns } from 'channels'
import { useClient } from 'sanity'
import { VisualEditingMsg } from 'visual-editing-helpers'
import { LiveQueryProvider, useLiveQuery } from '@sanity/preview-kit'
import { useEffect, useMemo } from 'react'
// import { createClient } from '@sanity/preview-kit/client'

export default function LoaderQueries(props: {
  channel: ChannelReturns<VisualEditingMsg> | undefined
  perspective: ClientPerspective
  liveQueries: Record<string, { query: string; params: QueryParams }>
}): any {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { channel, perspective, liveQueries } = props
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const studioClient = useClient({ apiVersion: '2023-10-16' })
  const clientConfig = useMemo(() => studioClient.config(), [studioClient])
  const client = useMemo(
    () => studioClient.withConfig({ perspective, resultSourceMap: true }),
    [perspective, studioClient],
  )

  useEffect(() => {
    console.log({ clientConfig, liveQueries, perspective, channel })
  }, [channel, clientConfig, liveQueries, perspective])

  return (
    <LiveQueryProvider client={client} turboSourceMap logger={console}>
      {Object.entries(liveQueries).map(([key, { query, params }]) => (
        <QuerySubscription
          key={key}
          projectId={clientConfig.projectId!}
          dataset={clientConfig.dataset!}
          query={query}
          params={params}
          channel={channel}
        />
      ))}
    </LiveQueryProvider>
  )
}

const initialData = {}

function QuerySubscription(props: {
  projectId: string
  dataset: string
  query: string
  params: QueryParams
  channel: ChannelReturns<VisualEditingMsg> | undefined
}) {
  const { projectId, dataset, query, params, channel } = props

  const [result, loading] = useLiveQuery(initialData, query, params)
  const shouldSend = useMemo(
    () => channel && !loading && initialData !== result,
    [channel, loading, result],
  )

  useEffect(() => {
    console.log('QuerySubscription', {
      shouldSend,
      projectId,
      dataset,
      query,
      params,
      result,
    })
    if (shouldSend) {
      channel!.send('loader/query-change', {
        projectId,
        dataset,
        query,
        params,
        result,
      })
    }
  }, [channel, dataset, params, projectId, query, result, shouldSend])

  return null
}
