import {type PreviewKitNodeMsg} from '@repo/visual-editing-helpers'
import type {ContentSourceMapDocuments} from '@sanity/client/csm'
import {createNode, type Message, type Node} from '@sanity/comlink'
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
  const [comlink, setComlink] = useState<Node<Message, PreviewKitNodeMsg> | null>(null)

  const [connected, setConnected] = useState(false)
  useEffect(() => {
    if (window.self === window.top && !window.opener) {
      return
    }
    const comlink = createNode<Message, PreviewKitNodeMsg>({
      name: 'preview-kit',
      connectTo: 'presentation',
    })

    comlink.onStatus((status) => {
      if (status === 'connected') {
        setConnected(true)
      } else if (status === 'disconnected') {
        setConnected(false)
      }
    })

    const timeout = setTimeout(() => setComlink(comlink), 0)
    const stop = comlink.start()
    return () => {
      stop()
      setComlink(null)
      clearTimeout(timeout)
    }
  }, [dataset, projectId])

  const changedKeys = JSON.stringify(Array.from(documentsInUse.keys()))
  useEffect(() => {
    if (changedKeys !== '[]' && comlink && connected) {
      comlink.post({
        type: 'preview-kit/documents',
        data: {
          projectId,
          dataset,
          perspective: 'previewDrafts',
          documents: Array.from(documentsInUse.values()),
        },
      })
    }
  }, [changedKeys, comlink, connected, dataset, documentsInUse, projectId])
}
