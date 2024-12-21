import {
  createCompatibilityActors,
  type VisualEditingControllerMsg,
  type VisualEditingNodeMsg,
} from '@repo/visual-editing-helpers'
import {createNode, createNodeMachine} from '@sanity/comlink'
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

    let timeout = 0
    const stop = instance.start()
    // Wait with forwarding the comlink until the connection is established
    const unsubscribe = instance.onStatus(() => {
      // Due to race conditions in when Presentation Tool loads up components with handlers for comlink, we need to wait a bit before forwarding the comlink instance
      timeout = window.setTimeout(() => {
        setNode(instance)
      }, 3_000)
    }, 'connected')

    return () => {
      clearTimeout(timeout)
      unsubscribe()
      stop()
      setNode(undefined)
    }
  }, [active])

  return node
}
