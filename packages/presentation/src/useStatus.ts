import type {Status, StatusEvent} from '@sanity/comlink'
import {useCallback, useMemo, useState} from 'react'

export function useStatus(): [string, (event: StatusEvent) => void] {
  const [statusMap, setStatusMap] = useState(
    new Map<string, {status: Status; hasConnected: boolean}>(),
  )

  const status = useMemo(() => {
    const values = Array.from(statusMap.values())
    const handshaking = values.filter(({status}) => status === 'handshaking')
    if (handshaking.length) {
      return handshaking.some(({hasConnected}) => !hasConnected) ? 'connecting' : 'reconnecting'
    }
    if (values.find(({status}) => status === 'connected')) {
      return 'connected'
    }
    return 'idle'
  }, [statusMap])

  const setStatusFromEvent = useCallback((event: StatusEvent) => {
    setStatusMap((prev) => {
      const next = new Map(prev)
      if (event.status === 'disconnected') {
        next.delete(event.channel)
      } else {
        const hasConnected = next.get(event.channel)?.hasConnected || event.status === 'connected'
        next.set(event.channel, {status: event.status, hasConnected})
      }
      return next
    })
  }, [])

  return [status, setStatusFromEvent]
}
