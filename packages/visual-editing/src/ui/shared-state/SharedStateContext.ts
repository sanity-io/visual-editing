import {createContext} from 'react'
import type {VisualEditingNode} from '../../types'
import type {SharedStateStore} from './sharedStateStore'

export interface SharedStateContextValue {
  comlink?: VisualEditingNode
  store: SharedStateStore
}

export const SharedStateContext = createContext<SharedStateContextValue | null>(null)
