import type {Serializable, SerializableObject} from '@sanity/presentation-comlink'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type FunctionComponent,
  type PropsWithChildren,
} from 'react'
import type {VisualEditingConnection} from '../types'
import {SharedStateContext, type SharedStateContextValue} from './SharedStateContext'

export const SharedStateProvider: FunctionComponent<
  PropsWithChildren<{
    comlink: VisualEditingConnection | null
  }>
> = function (props) {
  const {comlink, children} = props

  const sharedState = useRef<SerializableObject>({})

  useEffect(() => {
    return comlink?.on('visual-editing/shared-state', () => {
      return {state: sharedState.current}
    })
  }, [comlink])

  const setValue = useCallback(
    (key: string, value: Serializable) => {
      sharedState.current[key] = value
      comlink?.post('presentation/shared-state', {key, value})
    },
    [comlink],
  )

  const removeValue = useCallback(
    (key: string) => {
      comlink?.post('presentation/shared-state', {key})
      delete sharedState.current[key]
    },
    [comlink],
  )

  const context = useMemo<SharedStateContextValue>(
    () => ({removeValue, setValue}),
    [removeValue, setValue],
  )

  return <SharedStateContext.Provider value={context}>{children}</SharedStateContext.Provider>
}
