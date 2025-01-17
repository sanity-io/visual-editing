import {useCallback, useEffect, useState, useSyncExternalStore} from 'react'

/**
 * 'hit' - the cache is fresh and valid
 * 'stale' - the cache should revalidate, but can't/shouldn't yet (offline, visibility = hidden)
 * 'refresh' - stale cache, and now is a great time to start refreshing
 * 'inflight' - refreshing cache, revalidate events should be ignored
 */
export type RevalidateState = 'hit' | 'stale' | 'refresh' | 'inflight'
/**
 * Keeps track of when queries should revalidate
 */
export function useRevalidate(props: {
  /**
   * How frequently queries should be refetched in the background to refresh the parts of queries that can't be source mapped.
   * Setting it to `0` will disable background refresh.
   */
  refreshInterval: number
}): [RevalidateState, () => () => void] {
  const {refreshInterval} = props

  const shouldPause = useShouldPause()
  const [state, setState] = useState<RevalidateState>('hit')

  // Keep track of indicators for when revalidation should be 'paused'
  // Like if we're currently offline, or the document isn't visible
  // Basically if 'stale' and all good we return 'refresh'

  // Next keep track of staleness itself. If we come back online, on a windows focus event
  // or on a refreshInterval timeout
  // Basically it controls if cache should be 'hit' or 'stale'

  // How to handle refresh to inflight?

  const startRefresh = useCallback(() => {
    setState('inflight')
    return () => setState('hit')
  }, [])

  // Revalidate on refreshInterval
  useEffect(() => {
    // If refreshInterval is nullish then we don't want to refresh.
    // Inflight means it's already refreshing and we pause the countdown.
    // It's only necessary to start the countdown if the cache isn't already stale
    if (!refreshInterval || state !== 'hit') {
      return
    }
    const timeout = setTimeout(() => setState('stale'), refreshInterval)
    return () => clearTimeout(timeout)
  }, [refreshInterval, state])
  // Revalidate on windows focus
  useEffect(() => {
    if (state !== 'hit') {
      return
    }
    const onFocus = () => setState('stale')
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [refreshInterval, state])
  // Revalidate on changes to shouldPause
  useEffect(() => {
    // Mark as stale pre-emptively if we're offline or the document isn't visible
    if (shouldPause && state === 'hit') {
      setState('stale')
    }
    // If not paused we can mark stale as ready for refresh
    if (!shouldPause && state === 'stale') {
      setState('refresh')
    }
  }, [shouldPause, state])

  return [state, startRefresh]
}

/**
 * Keeps track of when revalidation and activities should be paused
 */
function useShouldPause(): boolean {
  const [online, setOnline] = useState(false)
  useEffect(() => {
    setOnline(navigator.onLine)
    const online = () => setOnline(true)
    const offline = () => setOnline(false)
    window.addEventListener('online', online)
    window.addEventListener('offline', offline)
    return () => {
      window.removeEventListener('online', online)
      window.removeEventListener('offline', offline)
    }
  }, [])
  const visibilityState = useSyncExternalStore(
    onVisibilityChange,
    () => document.visibilityState,
    () => 'hidden' satisfies DocumentVisibilityState,
  )

  // Should pause activity when offline
  if (!online) {
    return true
  }

  // Should pause when the document isn't visible, as it's likely the user isn't looking at the page
  if (visibilityState === 'hidden') {
    return true
  }

  return false
}

function onVisibilityChange(onStoreChange: () => void): () => void {
  document.addEventListener('visibilitychange', onStoreChange)
  return () => document.removeEventListener('visibilitychange', onStoreChange)
}
