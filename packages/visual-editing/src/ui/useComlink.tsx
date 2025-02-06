import {createNode, createNodeMachine, type Status} from '@sanity/comlink'
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
export function useComlink(active: boolean = true): [VisualEditingNode | undefined, Status] {
  const [node, setNode] = useState<VisualEditingNode>()
  const [status, setStatus] = useState<Status>('idle')

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
    const unsub = instance.onStatus(() => setStatus('connected'), 'connected')

    setNode(instance)
    const stop = instance.start()

    return () => {
      unsub()
      stop()
      setNode(undefined)
    }
  }, [active])

  return [node, status]
}
