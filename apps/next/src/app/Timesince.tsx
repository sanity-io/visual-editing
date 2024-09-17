'use client'

import {useEffect, useMemo, useState, useSyncExternalStore} from 'react'

const subscribe = () => () => {}
export function Timesince(props: {since: string}) {
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

const rtf = new Intl.RelativeTimeFormat('en', {style: 'short'})
export function formatTimeSince(from: Date, to: Date): string {
  const seconds = Math.floor((from.getTime() - to.getTime()) / 1000)
  if (seconds > -60) {
    return rtf.format(Math.min(seconds, -1), 'second')
  }
  const minutes = Math.ceil(seconds / 60)
  if (minutes > -60) {
    return rtf.format(minutes, 'minute')
  }
  const hours = Math.ceil(minutes / 60)
  if (hours > -24) {
    return rtf.format(hours, 'hour')
  }
  const days = Math.ceil(hours / 24)
  return rtf.format(days, 'day')
}
