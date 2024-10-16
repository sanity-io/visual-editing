import type {MutationEvent, ReconnectEvent, WelcomeEvent} from '@sanity/client'
import {memo, useEffect, type FunctionComponent} from 'react'
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

  useEffect(() => {
    const listener = client
      .listen(
        '*[!(_id in path("_.**"))]',
        {},
        {
          effectFormat: 'mendoza',
          events: ['welcome', 'mutation', 'reconnect'],
          includePreviousRevision: false,
          includeResult: false,
          tag: 'presentation-documents',
          visibility: 'transaction',
        },
      )
      .pipe(
        filter(
          (event): event is WelcomeEvent | ReconnectEvent | MutationEvent =>
            event.type === 'welcome' || event.type === 'reconnect' || event.type === 'mutation',
        ),
      )

    const subscription = listener.subscribe((event) => {
      comlink.post({type: 'presentation/snapshot-event', data: {event}})
    })

    return () => subscription.unsubscribe()
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
