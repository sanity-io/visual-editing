import {
  ChannelEventHandler,
  ChannelMsg,
  ChannelReturns,
  createChannel,
} from 'channels'
import { useEffect, useRef } from 'react'

export function useChannel<T extends ChannelMsg>(
  handler: ChannelEventHandler<T>,
): ChannelReturns<T> | undefined {
  const channelRef = useRef<ChannelReturns<T>>()

  useEffect(() => {
    const channel = createChannel<T>({
      id: 'overlays',
      connections: [
        {
          target: parent,
          id: 'composer',
        },
      ],
      handle: handler,
    })
    channelRef.current = channel
    return () => {
      channel.disconnect()
      channelRef.current = undefined
    }
  }, [handler])

  return channelRef.current
}
