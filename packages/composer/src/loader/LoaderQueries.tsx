import type { ClientPerspective, QueryParams } from '@sanity/client'
import { ChannelReturns } from 'channels'
import { useEffect, useMemo, useState } from 'react'
import { type SanityDocument, useClient } from 'sanity'
import { VisualEditingMsg } from 'visual-editing-helpers'

import LiveStoreProvider from './LiveStoreProvider'
import { useLiveQuery } from './useLiveQuery'

export default function LoaderQueries(props: {
  activePerspective: boolean
  documentId?: string
  documentType?: string
  channel: ChannelReturns<VisualEditingMsg> | undefined
  perspective: ClientPerspective
  liveQueries: Record<string, { query: string; params: QueryParams }>
}): any {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {
    activePerspective,
    documentId,
    documentType,
    channel,
    perspective,
    liveQueries,
  } = props
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const studioClient = useClient({ apiVersion: '2023-10-16' })
  const clientConfig = useMemo(() => studioClient.config(), [studioClient])
  const client = useMemo(
    () =>
      studioClient.withConfig({
        perspective,
        resultSourceMap: 'withKeyArraySelector',
      }),
    [perspective, studioClient],
  )
  useEffect(() => {
    if (channel && activePerspective) {
      const { projectId, dataset } = clientConfig
      channel.send('loader/perspective', {
        projectId: projectId!,
        dataset: dataset!,
        perspective,
      })
    }
  }, [activePerspective, channel, clientConfig, perspective])

  // @TODO it's no longer necessary for the `sanity` pink-lizard build to emit these events
  const [cachedDraft, setCachedDraft] = useState<SanityDocument>()
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (
        event.origin === location.origin &&
        typeof event.data === 'object' &&
        event.data?.type === 'editState' &&
        event.data?.sanity === true
      ) {
        const { draft, published } = event.data as {
          draft: SanityDocument | null | undefined
          published: SanityDocument | null | undefined
        }
        if (
          perspective === 'previewDrafts' &&
          `drafts.${documentId}` === draft?._id &&
          documentType === draft?._type
        ) {
          setCachedDraft(draft)
        }
        if (
          perspective === 'published' &&
          documentId === published?._id &&
          documentType === published?._type
        ) {
          setCachedDraft(published!)
        }
      }
    }
    window.addEventListener('message', handler, false)
    return () => window.removeEventListener('message', handler, false)
  }, [documentId, documentType, perspective])

  const draft = useMemo(() => {
    if (
      perspective === 'previewDrafts' &&
      `drafts.${documentId}` === cachedDraft?._id &&
      documentType === cachedDraft?._type
    ) {
      return cachedDraft
    }
    return
  }, [cachedDraft, documentId, documentType, perspective])

  return (
    <LiveStoreProvider
      draft={draft!}
      client={client}
      turboSourceMap
      logger={console}
      perspective={perspective}
    >
      {Object.entries(liveQueries).map(([key, { query, params }]) => (
        <QuerySubscription
          key={`${key}${perspective}`}
          projectId={clientConfig.projectId!}
          dataset={clientConfig.dataset!}
          perspective={perspective}
          query={query}
          params={params}
          channel={channel}
        />
      ))}
    </LiveStoreProvider>
  )
}

const initialData = {}

function QuerySubscription(props: {
  projectId: string
  dataset: string
  perspective: ClientPerspective
  query: string
  params: QueryParams
  channel: ChannelReturns<VisualEditingMsg> | undefined
}) {
  const { projectId, dataset, perspective, query, params, channel } = props

  const data = useLiveQuery(initialData, query, params)
  const { result, resultSourceMap } = data || ({} as any)

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('QuerySubscription', {
      projectId,
      dataset,
      perspective,
      query,
      params,
      result,
    })
    channel!.send('loader/query-change', {
      projectId,
      dataset,
      perspective,
      query,
      params,
      result,
      resultSourceMap,
    })
  }, [
    channel,
    dataset,
    params,
    projectId,
    query,
    result,
    resultSourceMap,
    perspective,
  ])

  return null
}
