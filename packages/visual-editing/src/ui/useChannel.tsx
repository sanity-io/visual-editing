import { type ChannelsNode, createChannelsNode } from '@sanity/channels'
import type { VisualEditingConnectionIds } from '@sanity/visual-editing-helpers'
import { useEffect, useRef } from 'react'

import {
  VisualEditingChannelReceives as Receives,
  VisualEditingChannelSends as Sends,
} from '../types'

/**
 * Hook for maintaining a channel between overlays and the presentation tool
 * @internal
 */
export function useChannel(): ChannelsNode<Sends, Receives> | undefined {
  const channelRef = useRef<ChannelsNode<Sends, Receives>>()

  useEffect(() => {
    const channel = createChannelsNode<Sends, Receives>({
      id: 'overlays' satisfies VisualEditingConnectionIds,
      connectTo: 'presentation' satisfies VisualEditingConnectionIds,
    })
    channelRef.current = channel
    return () => {
      channel.destroy()
      channelRef.current = undefined
    }
  }, [])

  return channelRef.current
}
