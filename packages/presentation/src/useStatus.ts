import type {Status, StatusEvent} from '@sanity/comlink'
import {useCallback, useMemo, useState} from 'react'

export function useStatus(): [string, (event: StatusEvent) => void] {
  const [statusMap, setStatusMap] = useState(new Map<string, Status>())

  const status = useMemo(() => {
    const values = Array.from(statusMap.values())
    if (values.includes('connecting')) return 'connecting'
    if (values.includes('connected')) return 'connected'
    return 'idle'
  }, [statusMap])

  const setStatusFromEvent = useCallback((event: StatusEvent) => {
    setStatusMap((prev) => {
      const next = new Map(prev)
      if (event.status === 'disconnected') {
        next.delete(event.channel)
      } else {
        next.set(event.channel, event.status)
      }
      return next
    })
  }, [])

  return [status, setStatusFromEvent]
}
