import type {ChannelsChannel} from '@repo/channels'
import type {PresentationAPI} from '@repo/visual-editing-helpers'
import type {MutationEvent, ReconnectEvent, SanityDocument, WelcomeEvent} from '@sanity/client'
import {type FunctionComponent, memo, useEffect, useMemo, useState} from 'react'
import {filter} from 'rxjs'
import {useClient} from 'sanity'

import {API_VERSION} from '../constants'

interface PostMessageDocumentsProps {
  channel: ChannelsChannel<PresentationAPI, 'visual-editing'>
}

const PostMessageDocuments: FunctionComponent<PostMessageDocumentsProps> = ({channel}) => {
  const client = useClient({apiVersion: API_VERSION})

  const [documentIds, setDocumentIds] = useState<string[]>([])
  const shouldObserve = useMemo(() => documentIds.length > 0, [documentIds])

  useEffect(() => {
    if (!shouldObserve) return

    const subscriber = client
      .listen(
        '*[!(_id in path("_.**"))]',
        {},
        {
          effectFormat: 'mendoza',
          events: ['welcome', 'mutation', 'reconnect'],
          includePreviousRevision: false,
          includeResult: false,
          tag: 'presentation-test',
          visibility: 'transaction',
        },
      )
      .pipe(
        filter(
          (event): event is WelcomeEvent | ReconnectEvent | MutationEvent =>
            event.type === 'welcome' || event.type === 'reconnect' || event.type === 'mutation',
        ),
      )
      .subscribe((event) => {
        channel.post('snapshot/event', {event})
      })

    return () => {
      subscriber.unsubscribe()
    }
  }, [channel, client, shouldObserve])

  useEffect(() => {
    return channel.on('snapshots/observe', async (data) => {
      setDocumentIds(data.documentIds)
    })
  }, [channel, client])

  useEffect(() => {
    return channel.on('snapshots/snapshot', async (data) => {
      const snapshot = await client.getDocument<SanityDocument>(data.documentId, {
        tag: 'document.snapshots',
      })
      return {snapshot}
    })
  }, [channel, client])

  useEffect(() => {
    return channel.on('mutate', async (data) => {
      return client.dataRequest('mutate', data, {
        visibility: 'async',
        returnDocuments: true,
      })
    })
  }, [channel, client])

  return null
}

export default memo(PostMessageDocuments)
