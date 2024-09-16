import type {SanityDocument} from '@sanity/types'
import {type ActorRefFrom, createEmptyActor} from 'xstate'

import {createDatasetMutator} from '../comlink'

export type MutatorActor = ActorRefFrom<ReturnType<typeof createDatasetMutator>>
export type EmptyActor = typeof emptyActor
export type OptimisticReducerAction = {
  id: string
  type: 'appear' | 'mutate' | 'disappear'
  document: SanityDocument
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type OptimisticReducer<T = any> = (state: T, action: OptimisticReducerAction) => T

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
