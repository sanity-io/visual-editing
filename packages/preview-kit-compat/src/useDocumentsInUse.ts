import type { ContentSourceMapDocuments } from '@sanity/client/csm'
import { type ChannelReturns, createChannel } from 'channels'
import { useEffect, useState } from 'react'
import {
  type VisualEditingConnectionIds,
  type VisualEditingMsg,
} from 'visual-editing-helpers'

/**
 * Reports the documents in use on the page to the Presentation Tool, if a connection can be established.
 * @internal
 */
export function useDocumentsInUse(
  documentsInUse: Map<string, ContentSourceMapDocuments[number]>,
  allowStudioOrigin: string | null,
  projectId: string,
  dataset: string,
): void {
  const [channel, setChannel] = useState<
    ChannelReturns<VisualEditingMsg> | undefined
  >()
  const [connected, setConnected] = useState(false)
  useEffect(() => {
    const targetOrigin = new URL(allowStudioOrigin || '/', location.origin)
      .origin
    const channel = createChannel<VisualEditingMsg>({
      id: 'preview-kit' satisfies VisualEditingConnectionIds,
      onStatusUpdate(status) {
        if (status === 'connected') {
          setConnected(true)
        } else if (status === 'disconnected' || status === 'unhealthy') {
          setConnected(false)
        }
      },
      connections: [
        {
          target: parent,
          targetOrigin,
          id: 'presentation' satisfies VisualEditingConnectionIds,
        },
      ],
      handler: () => {},
    })
    const timeout = setTimeout(() => setChannel(channel), 0)
    return () => {
      clearTimeout(timeout)
      channel.disconnect()
      setChannel(undefined)
    }
  }, [allowStudioOrigin, dataset, projectId])

  const changedKeys = JSON.stringify(Array.from(documentsInUse.keys()))
  useEffect(() => {
    if (changedKeys !== '[]' && channel && connected) {
      channel.send('preview-kit/documents', {
        projectId,
        dataset,
        perspective: 'previewDrafts',
        documents: Array.from(documentsInUse.values()),
      })
    }
  }, [changedKeys, channel, connected, dataset, documentsInUse, projectId])
}
