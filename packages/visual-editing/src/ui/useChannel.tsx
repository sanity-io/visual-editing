import { type ChannelsNode, createChannelsNode } from '@sanity/channels'
import type { VisualEditingConnectionIds } from '@sanity/visual-editing-helpers'
import { useEffect, useState } from 'react'

import type {
  VisualEditingChannelReceives as Receives,
  VisualEditingChannelSends as Sends,
} from '../types'

/**
 * Hook for maintaining a channel between overlays and the presentation tool
 * @internal
 */
export function useChannel(): ChannelsNode<Sends, Receives> | undefined {
  const [channel, setChannel] = useState<ChannelsNode<Sends, Receives>>()

  useEffect(() => {
    const channelInstance = createChannelsNode<Sends, Receives>({
      id: 'overlays' satisfies VisualEditingConnectionIds,
      connectTo: 'presentation' satisfies VisualEditingConnectionIds,
    })
    setChannel(channelInstance)
    return () => {
      channelInstance.destroy()
    }
  }, [])

  return channel
}
