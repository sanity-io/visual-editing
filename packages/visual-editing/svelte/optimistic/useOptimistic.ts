import type {SanityDocument} from '@sanity/types'
import {DRAFTS_PREFIX} from '@sanity/visual-editing-csm'
import {
  isEmptyActor,
  type OptimisticReducer,
  type OptimisticReducerAction,
} from '@sanity/visual-editing/optimistic'
import {onMount} from 'svelte'
import {derived, get, writable, type Readable} from 'svelte/store'
import {optimisticActor} from './optimisticActor'

function getPublishedId(id: string): string {
  return id.startsWith(DRAFTS_PREFIX) ? id.slice(DRAFTS_PREFIX.length) : id
}

export function useOptimistic<T, U = SanityDocument>(
  initial: T,
  reducer: OptimisticReducer<T, U> | Array<OptimisticReducer<T, U>>,
): {value: Readable<T>; update: (newPassthrough: T) => void} {
  // The current passthrough state, either the initial value passed to the
  // function call or set via update
  const passthrough = writable<T>(initial)
  // The last action event that was received, if this is defined, we are in a
  // "dirty" state
  const lastEvent = writable<OptimisticReducerAction<U> | null>(null)
  // The optimistic state that is returned if we are in a "dirty" state
  const optimistic = writable<T>(initial)

  const reduceStateFromAction = (action: OptimisticReducerAction<U>, prevState: T) => {
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
  }

  let pristineTimeout: ReturnType<typeof setTimeout>

  onMount(() =>
    optimisticActor.subscribe((actor) => {
      // If the actor hasn't been set yet, we don't need to subscribe to mutations
      if (isEmptyActor(actor)) {
        return
      }
      // When a rebased event is received, apply it to the current optimistic
      // state, and update the last action to signal we are in a "dirty" state
      actor.on('rebased.local', (event) => {
        const action = {
          document: event.document as U,
          id: event.id,
          originalId: getPublishedId(event.id),
          type: 'mutate' as const,
        }
        optimistic.update((prev) => reduceStateFromAction(action, prev))
        lastEvent.set(action)
        clearTimeout(pristineTimeout)
      })

      // If no rebased events were received in the 15 seconds after a pristine
      // event, reset to a "pristine" state by removing the last event, and
      // align the optimistic state with the passthrough state
      actor.on('pristine', () => {
        pristineTimeout = setTimeout(() => {
          lastEvent.set(null)
          optimistic.set(get(passthrough))
        }, 15000)
      })
    }),
  )

  const updatePassthrough = (newPassthrough: T) => {
    // If we are in a dirty state (i.e. have a last event to apply) when the
    // passthrough is updated, apply it to the passthrough as optimistic state
    const $lastEvent = get(lastEvent)
    if ($lastEvent) {
      optimistic.set(reduceStateFromAction($lastEvent, newPassthrough))
    }
    // Also always update the passthrough state
    passthrough.set(newPassthrough)
  }

  // If we are in a "dirty" state (have an event to apply), return the
  // optimistic state, otherwise we are in the "pristine" state, so return the
  // passthrough state
  const optimisticValue = derived(
    [passthrough, optimistic, lastEvent],
    ([$passthrough, $optimistic, $lastEvent]) => {
      return $lastEvent ? $optimistic : $passthrough
    },
  )

  return {update: updatePassthrough, value: optimisticValue}
}
