import {getPublishedId} from '@sanity/client/csm'
import type {SanityDocument} from '@sanity/types'
import {startTransition, useEffect, useState} from 'react'
import {useEffectEvent} from 'use-effect-event'
import {isEmptyActor} from '../optimistic/context'
import type {OptimisticReducer, OptimisticReducerAction} from '../optimistic/types'
import {useOptimisticActor} from './useOptimisticActor'

export function useOptimistic<T, U = SanityDocument>(
  passthrough: T,
  reducer: OptimisticReducer<T, U> | Array<OptimisticReducer<T, U>>,
): T {
  const [pristine, setPristine] = useState(true)
  const [optimistic, setOptimistic] = useState<T>(passthrough)
  const [lastEvent, setLastEvent] = useState<OptimisticReducerAction<U> | null>(null)
  const [lastPassthrough, setLastPassthrough] = useState<T>(passthrough)

  const actor = useOptimisticActor()

  /**
   * This action is used in two `useEffect` hooks, it needs access to the provided `reducer`,
   * but doesn't want to cause re-renders if `reducer` changes identity.
   * The `useEffectEvent` hook ensures that the `reducer` value is never stale when used, and doesn't trigger setup and teardown of
   * `useEffect` deps to make it happen.
   */
  const reduceStateFromAction = useEffectEvent(
    (action: OptimisticReducerAction<U>, prevState: T) => {
      const reducers = Array.isArray(reducer) ? reducer : [reducer]
      return reducers.reduce(
        (acc, reducer) =>
          reducer(acc, {
            document: action.document,
            id: getPublishedId(action.id),
            originalId: action.id,
            type: action.type,
          }),
        prevState,
      )
    },
  )

  /**
   * Records the last passthrough value when reducers ran in response to a rebased event.
   * This allows us to later know when reducers should run should the passthrough change.
   */
  const updateLastPassthrough = useEffectEvent(() => setLastPassthrough(passthrough))

  /**
   * Handle rebase events, which runs the provided reducers,
   * caches the event that was used to produce the new state,
   * and marks the state as non-pristine.
   */
  useEffect(() => {
    // If the actor hasn't been set yet, we don't need to subscribe to mutations
    if (isEmptyActor(actor)) {
      return
    }

    /**
     * The pristine event fires much too soon, so the temporary workaround is that we greatly delay firing `setPristine(true)`,
     * and instead relying on re-running reducers with the last event whenever the passthrough changes, to preserve the optimistic state,
     * until we hopefully have eventual consistency on the passthrough.
     */
    let pristineTimeout: ReturnType<typeof setTimeout>

    const rebasedSub = actor.on('rebased.local', (_event) => {
      const event = {
        // @todo You shall not cast
        document: _event.document as U,
        id: _event.id,
        originalId: getPublishedId(_event.id),
        // @todo This should eventually be emitted by the state machine
        type: 'mutate' as const,
      }
      setOptimistic((prevState) => reduceStateFromAction(event, prevState))
      setLastEvent(event)
      updateLastPassthrough()
      setPristine(false)

      clearTimeout(pristineTimeout)
    })
    const pristineSub = actor.on('pristine', () => {
      pristineTimeout = setTimeout(() => {
        // Marking it in a startTransition allows react to interrupt the resulting render, should a new rebase happen and we're back to dirty
        startTransition(() => setPristine(true))
      }, 15000)
    })
    return () => {
      rebasedSub.unsubscribe()
      pristineSub.unsubscribe()
    }
  }, [actor])

  /**
   * If the passthrough changes, and we are in a dirty state, we rerun the reducers with the new passthrough but the previous event.
   * Marking it in a transition allows react to interrupt this render should a new action happen, or should we be back in a pristine state.
   */
  useEffect(() => {
    if (pristine) {
      // if we are pristine, then we will passthrough anyway
      return undefined
    }
    if (!lastEvent) {
      // If we don't have a lastEvent when we are pristine, it's a fatal error
      throw new Error('No last event found when syncing passthrough')
    }
    if (lastPassthrough === passthrough) {
      // If the passthrough hasn't changed, then we don't need to rerun the reducers
      return undefined
    }

    // Marking it in a startTransition allows react to interrupt the resulting render, should a new rebase happen
    startTransition(() => {
      setOptimistic(reduceStateFromAction(lastEvent, passthrough))
      setLastPassthrough(passthrough)
    })
  }, [lastEvent, lastPassthrough, passthrough, pristine])

  return pristine ? passthrough : optimistic
}
