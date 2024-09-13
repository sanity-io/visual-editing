import {useCallback, useEffect, useState} from 'react'

import {isEmptyActor, type OptimisticReducer, type OptimisticReducerAction} from './context'
import {useOptimisticActor} from './useOptimisticActor'

export function useOptimistic<T>(
  passthrough: T,
  reducer: OptimisticReducer<T> | Array<OptimisticReducer<T>>,
): T {
  const [state, setState] = useState<T>(passthrough)

  const actor = useOptimisticActor()

  const setStateFromReducer = useCallback(
    (action: OptimisticReducerAction) => {
      const reducers = Array.isArray(reducer) ? reducer : [reducer]
      setState((prevState) => {
        return reducers.reduce(
          (acc, reducer) => reducer(acc, {type: action.type, document: action.document}),
          prevState,
        )
      })
    },
    [reducer],
  )

  useEffect(() => {
    // If the actor hasn't been set yet, we don't need to subscribe to mutations
    if (isEmptyActor(actor)) {
      const inFrame = window.self !== window.top || window.opener
      if (inFrame) {
        // eslint-disable-next-line no-console
        console.warn('useOptimisticMutate called with empty actor')
      }
      return
    }

    const subscription = actor.on('mutation', (event) => {
      // @ts-expect-error @todo state machine will emit this
      setStateFromReducer({document: event.document, type: 'mutate'})
    })

    return () => subscription.unsubscribe()
  }, [actor, setStateFromReducer])

  return isEmptyActor(actor) ? passthrough : state
}
