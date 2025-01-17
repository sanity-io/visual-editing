import {createNode, createNodeMachine} from '@sanity/comlink'
import {
  createCompatibilityActors,
  type VisualEditingControllerMsg,
  type VisualEditingNodeMsg,
} from '@sanity/presentation-comlink'
import {useEffect, useState} from 'react'
import type {VisualEditingNode} from '../types'

/**
 * Hook for maintaining a channel between overlays and the presentation tool
 * @internal
 */
export function useComlink(active: boolean = true): VisualEditingNode | undefined {
  const [node, setNode] = useState<VisualEditingNode>()

  useEffect(() => {
    if (!active) return
    const instance = createNode<VisualEditingNodeMsg, VisualEditingControllerMsg>(
      {
        name: 'visual-editing',
        connectTo: 'presentation',
      },
      createNodeMachine<VisualEditingNodeMsg, VisualEditingControllerMsg>().provide({
        actors: createCompatibilityActors<VisualEditingNodeMsg>(),
      }),
    )

    setNode(instance)
    const stop = instance.start()

    return () => {
      stop()
      setNode(undefined)
    }
  }, [active])

  return node
}
