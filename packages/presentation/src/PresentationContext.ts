import { createContext } from 'react'

import {
  DeskDocumentPaneParams,
  PresentationNavigate,
  PresentationParams,
} from './types'

export interface PresentationContextValue {
  deskParams: DeskDocumentPaneParams
  devMode: boolean
  name: string
  navigate: PresentationNavigate
  params: PresentationParams
}

export const PresentationContext =
  createContext<PresentationContextValue | null>(null)
