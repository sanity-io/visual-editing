import {createContext} from 'react'

import type {
  PersistentSearchParams,
  PresentationNavigate,
  PresentationParams,
  StructureDocumentPaneParams,
} from './types'

export interface PresentationContextValue {
  devMode: boolean
  name: string
  navigate: PresentationNavigate
  params: PresentationParams
  structureParams: StructureDocumentPaneParams
  searchParams: PersistentSearchParams
}

export const PresentationContext = createContext<PresentationContextValue | null>(null)
