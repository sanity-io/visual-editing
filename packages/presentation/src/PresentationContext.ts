import { createContext } from 'react'

import {
  DeskDocumentPaneParams,
  PresentationParams,
  SetPresentationParams,
} from './types'

export interface PresentationContextValue {
  deskParams: DeskDocumentPaneParams
  devMode: boolean
  name: string
  params: PresentationParams
  setParams: SetPresentationParams
}

export const PresentationContext =
  createContext<PresentationContextValue | null>(null)
