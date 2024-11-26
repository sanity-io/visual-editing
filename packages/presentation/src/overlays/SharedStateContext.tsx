import type {Serializable} from '@repo/visual-editing-helpers'
import {createContext} from 'react'

export interface SharedStateContextValue {
  removeValue: (key: string) => void
  setValue: (key: string, value: Serializable) => void
}

export const SharedStateContext = createContext<SharedStateContextValue | null>(null)
