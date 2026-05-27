import {createEmptyActor, type AnyActor} from 'xstate'

export type MutatorActor = AnyActor
export type EmptyActor = typeof emptyActor

export const emptyActor = createEmptyActor()

export let actor: MutatorActor | EmptyActor = emptyActor

export const listeners = new Set<() => void>()

export function isEmptyActor(a: MutatorActor | EmptyActor): boolean {
  return a === emptyActor
}

export function setActor(nextActor: MutatorActor): void {
  actor = nextActor
  for (const onActorChange of listeners) {
    onActorChange()
  }
}
