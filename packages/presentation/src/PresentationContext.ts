import { createContext } from 'react'

import { DeskDocumentPaneParams, PresentationParams } from './types'

export interface PresentationContextValue {
  deskParams: DeskDocumentPaneParams
  devMode: boolean
  params: PresentationParams
}

export const PresentationContext =
  createContext<PresentationContextValue | null>(null)
