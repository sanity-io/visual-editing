import { createContext } from 'react'

import { DeskDocumentPaneParams, PresentationParams } from './types'

export interface PresentationContextValue {
  deskParams: DeskDocumentPaneParams
  devMode: boolean
  name: string
  params: PresentationParams
}

export const PresentationContext =
  createContext<PresentationContextValue | null>(null)
