import {createEmptyActor, type ActorRefFrom} from 'xstate'
import {createDatasetMutator} from '../comlink'

export type MutatorActor = ActorRefFrom<ReturnType<typeof createDatasetMutator>>
export type EmptyActor = typeof emptyActor
export type OptimisticReducerAction<T> = {
  id: string
  type: 'appear' | 'mutate' | 'disappear'
  document: T
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type OptimisticReducer<T, U> = (state: T, action: OptimisticReducerAction<U>) => T

export const emptyActor = createEmptyActor()

export let actor: MutatorActor | EmptyActor = emptyActor

export const listeners = new Set<() => void>()

export function isEmptyActor(actor: MutatorActor | EmptyActor): actor is EmptyActor {
  return actor === emptyActor
}

export function setActor(nextActor: MutatorActor): void {
  actor = nextActor
  for (const onActorChange of listeners) {
    onActorChange()
  }
}
