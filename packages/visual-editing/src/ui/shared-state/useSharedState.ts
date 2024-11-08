import {useCallback, useContext, useSyncExternalStore} from 'react'
import {SharedStateContext} from './SharedStateContext'

export function useSharedState<
  T extends boolean | null | number | object | string | undefined | unknown = unknown,
>(key: string): T {
  const context = useContext(SharedStateContext)
  if (!context) {
    throw new Error('useSharedState must be used within a SharedStateProvider')
  }

  const {store} = context

  const value = useSyncExternalStore(
    store.subscribe,
    useCallback(() => store.getState()[key] as T, [key, store]),
  )

  return value
}
