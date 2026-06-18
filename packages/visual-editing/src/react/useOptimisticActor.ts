import {useCallback, useDeferredValue, useMemo, useSyncExternalStore} from 'react'

import {
  actor,
  emptyActor,
  isEmptyActor,
  listeners,
  type EmptyActor,
  type MutatorActor,
} from '../optimistic/context'

export function useOptimisticActor(): MutatorActor | EmptyActor {
  const subscribe = useCallback((listener: () => void) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }, [])

  const actorRef = useDeferredValue(useSyncExternalStore(
    subscribe,
    () => actor,
    () => emptyActor,
  ), emptyActor)

  return actorRef
}

export function useOptimisticActorReady(): boolean {
  const actor = useOptimisticActor()
  return useMemo(() => !isEmptyActor(actor), [actor])
}
