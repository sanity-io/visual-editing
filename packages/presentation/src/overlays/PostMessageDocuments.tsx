import type {MutationEvent, ReconnectEvent, WelcomeEvent} from '@sanity/client'
import {type FunctionComponent, memo, useEffect, useMemo, useState} from 'react'
import {filter} from 'rxjs'
import {useClient} from 'sanity'

import {API_VERSION} from '../constants'
import type {VisualEditingConnection} from '../types'

interface PostMessageDocumentsProps {
  comlink: VisualEditingConnection
}

const PostMessageDocuments: FunctionComponent<PostMessageDocumentsProps> = (props) => {
  const {comlink} = props
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
        comlink.post({type: 'presentation/snapshot-event', data: {event}})
      })

    return () => {
      subscriber.unsubscribe()
    }
  }, [client, comlink, shouldObserve])

  useEffect(() => {
    return comlink.on('visual-editing/observe-documents', async (data) => {
      setDocumentIds(data.documentIds)
    })
  }, [client, comlink])

  useEffect(() => {
    return comlink.on('visual-editing/fetch-snapshot', async (data) => {
      const snapshot = await client.getDocument(data.documentId, {
        tag: 'document.snapshots',
      })
      return {snapshot}
    })
  }, [client, comlink])

  useEffect(() => {
    return comlink.on('visual-editing/mutate', async (data) => {
      return client.dataRequest('mutate', data, {
        visibility: 'async',
        returnDocuments: true,
      })
    })
  }, [client, comlink])

  return null
}

export default memo(PostMessageDocuments)
