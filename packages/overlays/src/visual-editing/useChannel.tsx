import {
  ChannelEventHandler,
  ChannelMsg,
  ChannelReturns,
  createChannel,
} from 'channels'
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'

// @todo This seems like a hacky way of avoiding dependencies?
function useStableHandler<T extends ChannelMsg>(
  handler: ChannelEventHandler<T>,
): ChannelEventHandler<T> {
  // Store the handler as a ref
  const handlerRef = useRef<ChannelEventHandler<T> | null>(null)

  // Set the ref before render
  useLayoutEffect(() => {
    handlerRef.current = handler
  })

  // Return a stable function
  return useCallback<ChannelEventHandler<T>>(
    (...args) => handlerRef.current?.(...args),
    [],
  )
}

export function useChannel<T extends ChannelMsg>(
  handler: ChannelEventHandler<T>,
): ChannelReturns<T> | undefined {
  const channelRef = useRef<ChannelReturns<T>>()
  const stableHandler = useStableHandler<T>(handler)

  useEffect(() => {
    const channel = createChannel<T>({
      id: 'overlays',
      connections: [
        {
          target: parent,
          id: 'composer',
        },
      ],
      handle: stableHandler,
    })
    channelRef.current = channel
    return () => {
      channel.disconnect()
      channelRef.current = undefined
    }
  }, [stableHandler])

  return channelRef.current
}
