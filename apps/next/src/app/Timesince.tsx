'use client'

import { formatTimeSince } from 'apps-common/utils'
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'

const subscribe = () => () => {}
export function Timesince(props: { since: string }) {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
  const from = useMemo(() => new Date(props.since), [props.since])
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])
  if (!mounted) return 'now'
  return <span className="tabular-nums">{formatTimeSince(from, now)}</span>
}
