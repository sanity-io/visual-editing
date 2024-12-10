import {actor, listeners} from '@sanity/visual-editing/optimistic'
import {readable} from 'svelte/store'

export const optimisticActor = readable(actor, (set) => {
  const listener = () => {
    set(actor)
  }

  listeners.add(listener)

  return () => {
    actor.stop()
    listeners.delete(listener)
  }
})
