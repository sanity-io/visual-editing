import type {SerializableObject} from '@sanity/presentation-comlink'
import {useEffect, useMemo, type FunctionComponent, type PropsWithChildren} from 'react'
import type {VisualEditingNode} from '../../types'
import {SharedStateContext} from './SharedStateContext'

const createStore = (initialState: SerializableObject) => {
  let state = initialState
  const getState = () => state
  const listeners = new Set<() => void>()
  const setState = (fn: (state: SerializableObject) => SerializableObject) => {
    state = fn(state)
    listeners.forEach((l) => l())
  }
  const subscribe = (listener: () => void) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }
  return {getState, setState, subscribe}
}

const store = createStore({})

export const SharedStateProvider: FunctionComponent<
  PropsWithChildren<{
    comlink?: VisualEditingNode
  }>
> = (props) => {
  const {comlink, children} = props

  useEffect(() => {
    return comlink?.on('presentation/shared-state', (data) => {
      if ('value' in data) {
        store.setState((prev) => ({...prev, [data.key]: data.value}))
      } else {
        store.setState((prev) => {
          return Object.fromEntries(Object.entries(prev).filter(([key]) => key !== data.key))
        })
      }
    })
  }, [comlink])

  useEffect(() => {
    async function fetch() {
      const value = await comlink?.fetch('visual-editing/shared-state', undefined, {
        suppressWarnings: true,
      })
      if (value) {
        store.setState(() => value.state)
      }
    }
    fetch().catch((reason) => {
      // eslint-disable-next-line no-console
      console.debug(reason)
      // eslint-disable-next-line no-console
      console.warn(
        '[@sanity/visual-editing]: Failed to fetch shared state. Check your version of `sanity` is up-to-date',
      )
    })
  }, [comlink])

  const value = useMemo(() => ({comlink, store}), [comlink])

  return <SharedStateContext.Provider value={value}>{children}</SharedStateContext.Provider>
}
