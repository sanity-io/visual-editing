import { type ChannelsNode, createChannelsNode } from '@sanity/channels'
import type { ContentSourceMapDocuments } from '@sanity/client/csm'
import {
  type VisualEditingConnectionIds,
  type VisualEditingMsg,
} from '@sanity/visual-editing-helpers'
import { useEffect, useState } from 'react'

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
    ChannelsNode<VisualEditingMsg> | undefined
  >()
  const [connected, setConnected] = useState(false)
  useEffect(() => {
    if (window.self === window.top) {
      return
    }
    // const targetOrigin = new URL(allowStudioOrigin || '/', location.origin)
    //   .origin
    const channel = createChannelsNode<VisualEditingMsg>({
      id: 'preview-kit' satisfies VisualEditingConnectionIds,
      connectTo: 'presentation' satisfies VisualEditingConnectionIds,
      onStatusUpdate(status) {
        if (status === 'connected') {
          setConnected(true)
        } else if (status === 'disconnected') {
          setConnected(false)
        }
      },
    })
    const timeout = setTimeout(() => setChannel(channel), 0)
    return () => {
      clearTimeout(timeout)
      channel.destroy()
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
