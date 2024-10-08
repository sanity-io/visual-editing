import {useCallback, useSyncExternalStore} from 'react'
import {actor, emptyActor, listeners, type EmptyActor, type MutatorActor} from './context'

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
