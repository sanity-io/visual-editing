import type {SerializableObject} from '@sanity/presentation-comlink'

export interface SharedStateStore<T extends SerializableObject = SerializableObject> {
  getState: () => T
  setState: (fn: (state: T) => T) => void
  subscribe: (listener: () => void) => () => void
}

const createStore = <T extends SerializableObject>(initialState: T): SharedStateStore<T> => {
  let state = initialState
  const listeners = new Set<() => void>()

  const getState = () => state
  const setState = (fn: (state: T) => T) => {
    state = fn(state)
    listeners.forEach((l) => l())
  }

  const subscribe = (listener: () => void) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  return {getState, setState, subscribe}
}

export const store = createStore({})
