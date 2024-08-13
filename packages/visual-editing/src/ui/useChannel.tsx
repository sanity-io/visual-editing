import {ChannelsNode} from '@repo/channels'
import {type VisualEditingAPI} from '@repo/visual-editing-helpers'
import {useEffect, useState} from 'react'

/**
 * Hook for maintaining a channel between overlays and the presentation tool
 * @internal
 */
export function useChannel(): ChannelsNode<VisualEditingAPI> | undefined {
  const [channel, setChannel] = useState<ChannelsNode<VisualEditingAPI>>()

  useEffect(() => {
    const visualEditingChannel = new ChannelsNode<VisualEditingAPI>({
      id: 'visual-editing',
      connectTo: 'presentation',
    })
    setChannel(visualEditingChannel)
    return () => {
      visualEditingChannel.destroy()
    }
  }, [])

  return channel
}
