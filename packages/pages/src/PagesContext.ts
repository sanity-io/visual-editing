import { createContext } from 'react'

import { DeskDocumentPaneParams, PagesParams } from './types'

export interface PagesContextValue {
  deskParams: DeskDocumentPaneParams
  devMode: boolean
  params: PagesParams
}

export const PagesContext = createContext<PagesContextValue | null>(null)
