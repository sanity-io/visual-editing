import {
  createCompatibilityActors,
  type VisualEditingControllerMsg,
  type VisualEditingNodeMsg,
} from '@repo/visual-editing-helpers'
import {createNode, createNodeMachine, type Node} from '@sanity/comlink'
import {useEffect, useState} from 'react'

/**
 * Hook for maintaining a channel between overlays and the presentation tool
 * @internal
 */
export function useComlink(): Node<VisualEditingControllerMsg, VisualEditingNodeMsg> | undefined {
  const [node, setNode] = useState<Node<VisualEditingControllerMsg, VisualEditingNodeMsg>>()

  useEffect(() => {
    const instance = createNode<VisualEditingControllerMsg, VisualEditingNodeMsg>(
      {
        name: 'visual-editing',
        connectTo: 'presentation',
      },
      createNodeMachine<VisualEditingControllerMsg, VisualEditingNodeMsg>().provide({
        actors: createCompatibilityActors(),
      }),
    )

    setNode(instance)
    return instance.start()
  }, [])

  return node
}
