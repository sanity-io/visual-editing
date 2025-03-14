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

  /**
   * Handle reporting of status to the presentation tool in case of connection failure due to misconfigured URL origin
   */
  useEffect(() => {
    /**
     * We only need to report status if the node is not connected
     */
    if (status === 'connected') return

    const controller = new AbortController()
    window.addEventListener(
      'message',
      ({data, origin}: MessageEvent<unknown>) => {
        /**
         * Detect if Presentation is asking if Visual Editing is here but misconfigured
         * @TODO this should probably be a feature built into `comlink`, as it's a common problem for apps dealing with iframes.
         */
        if (
          data &&
          typeof data === 'object' &&
          'domain' in data &&
          data.domain === 'sanity/channels' &&
          'from' in data &&
          data.from === 'presentation' &&
          'type' in data &&
          data.type === 'presentation/status'
        ) {
          /**
           * We only send this message to the parent window, which supports Presentation loading the page in an iframe.
           * This avoids letting other iframes on the page, or other openers, from getting a response.
           */
          window.parent.postMessage(
            {
              domain: 'sanity/channels',
              type: 'visual-editing/status',
              data: {origin: location.origin},
            },
            /**
             * Using the same origin ensures that if the parent window don't have the same origin the message won't be sent.
             * This grants some protection against spoofing, as malicious iframes can't easily call this event and trigger the Presentation Tool to think there's a failing state.
             */
            origin,
          )
        }
      },
      {signal: controller.signal},
    )
    return () => {
      controller.abort()
    }
  }, [status])

  return [node, status]
}
