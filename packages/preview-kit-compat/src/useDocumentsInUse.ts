import {ChannelsNode} from '@repo/channels'
import {type PreviewKitAPI} from '@repo/visual-editing-helpers'
import type {ContentSourceMapDocuments} from '@sanity/client/csm'
import {useEffect, useState} from 'react'

/**
 * Reports the documents in use on the page to the Presentation Tool, if a connection can be established.
 * @internal
 */
export function useDocumentsInUse(
  documentsInUse: Map<string, ContentSourceMapDocuments[number]>,
  projectId: string,
  dataset: string,
): void {
  const [channel, setChannel] = useState<ChannelsNode<PreviewKitAPI> | undefined>()
  const [connected, setConnected] = useState(false)
  useEffect(() => {
    if (window.self === window.top && !window.opener) {
      return
    }
    const channel = new ChannelsNode<PreviewKitAPI>({
      id: 'preview-kit',
      connectTo: 'presentation',
    })

    channel.onStatus((status) => {
      if (status === 'connected') {
        setConnected(true)
      } else if (status === 'disconnected') {
        setConnected(false)
      }
    })

    const timeout = setTimeout(() => setChannel(channel), 0)
    return () => {
      clearTimeout(timeout)
      channel.destroy()
      setChannel(undefined)
    }
  }, [dataset, projectId])

  const changedKeys = JSON.stringify(Array.from(documentsInUse.keys()))
  useEffect(() => {
    if (changedKeys !== '[]' && channel && connected) {
      channel.post('documents', {
        projectId,
        dataset,
        perspective: 'previewDrafts',
        documents: Array.from(documentsInUse.values()),
      })
    }
  }, [changedKeys, channel, connected, dataset, documentsInUse, projectId])
}
