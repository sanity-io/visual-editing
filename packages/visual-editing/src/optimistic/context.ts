import {createEmptyActor, type ActorRefFrom} from 'xstate'
import {createDatasetMutator} from './state/datasetMutator'

export type MutatorActor = ActorRefFrom<ReturnType<typeof createDatasetMutator>>
export type EmptyActor = typeof emptyActor

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
