import {useCallback, useSyncExternalStore} from 'react'

import {actor, type EmptyActor, emptyActor, listeners, type MutatorActor} from './context'

// export const listeners = new Set()

export function useOptimisticActor(): MutatorActor | EmptyActor {
  const subscribe = useCallback((listener: () => void) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }, [])

  const actorRef = useSyncExternalStore(
    subscribe,
    () => actor,
    () => emptyActor,
  )

  return actorRef
}
