import type {ContentSourceMapDocuments} from '@sanity/client/csm'
import {createNode, createNodeMachine, type Message, type Node} from '@sanity/comlink'
import {
  createCompatibilityActors,
  isMaybePresentation,
  type PreviewKitNodeMsg,
} from '@sanity/presentation-comlink'
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
  const [comlink, setComlink] = useState<Node<PreviewKitNodeMsg, Message> | null>(null)

  const [connected, setConnected] = useState(false)
  useEffect(() => {
    if (!isMaybePresentation()) {
      return
    }
    const comlink = createNode<PreviewKitNodeMsg, Message>(
      {
        name: 'preview-kit',
        connectTo: 'presentation',
      },
      createNodeMachine<PreviewKitNodeMsg, Message>().provide({
        actors: createCompatibilityActors<PreviewKitNodeMsg>(),
      }),
    )

    comlink.onStatus(() => {
      setConnected(true)
    }, 'connected')

    const timeout = setTimeout(() => setComlink(comlink), 0)
    const stop = comlink.start()
    return () => {
      stop()
      setConnected(false)
      setComlink(null)
      clearTimeout(timeout)
    }
  }, [dataset, projectId])

  const changedKeys = JSON.stringify(Array.from(documentsInUse.keys()))
  useEffect(() => {
    if (changedKeys !== '[]' && comlink && connected) {
      comlink.post('preview-kit/documents', {
        projectId,
        dataset,
        perspective: 'previewDrafts',
        documents: Array.from(documentsInUse.values()),
      })
    }
  }, [changedKeys, comlink, connected, dataset, documentsInUse, projectId])
}
