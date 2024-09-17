import type {SanityDocumentBase} from '@sanity/mutate'
import type {SanityDocument} from '@sanity/types'
import {useCallback, useEffect, useRef, useState} from 'react'
import {getPublishedId} from '../../util/documents'
import {isEmptyActor, type OptimisticReducer, type OptimisticReducerAction} from './context'
import {useOptimisticActor} from './useOptimisticActor'

export function useOptimistic<T, U = SanityDocument>(
  passthrough: T,
  reducer: OptimisticReducer<T, U> | Array<OptimisticReducer<T, U>>,
): T {
  const [state, setState] = useState<T>(passthrough)

  const actor = useOptimisticActor()

  const reducerRef = useRef(reducer)
  useEffect(() => {
    reducerRef.current = reducer
  }, [reducer])

  const setStateFromAction = useCallback((action: OptimisticReducerAction<U>) => {
    const reducer = reducerRef.current
    const reducers = Array.isArray(reducer) ? reducer : [reducer]
    setState((prevState) => {
      return reducers.reduce(
        (acc, reducer) =>
          reducer(acc, {type: action.type, document: action.document, id: action.id}),
        prevState,
      )
    })
  }, [])

  const setStateFromEvent = useCallback(
    (event: {id: string; document: SanityDocumentBase}) =>
      setStateFromAction({
        id: getPublishedId(event.id),
        // @todo You shall not cast
        document: event.document as U,
        // @todo This should eventually be emitted by the state machine
        type: 'mutate',
      }),
    [setStateFromAction],
  )

  useEffect(() => {
    // If the actor hasn't been set yet, we don't need to subscribe to mutations
    if (isEmptyActor(actor)) {
      return
    }

    const subscription = actor.on('rebased.local', setStateFromEvent)

    return () => subscription.unsubscribe()
  }, [actor, setStateFromEvent])

  useEffect(() => {
    setState(passthrough)
  }, [passthrough])

  return state
}
