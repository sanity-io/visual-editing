import {createContext} from 'react'
import type {
  PresentationNavigate,
  PresentationParams,
  PresentationSearchParams,
  StructureDocumentPaneParams,
} from './types'

export interface PresentationContextValue {
  devMode: boolean
  name: string
  navigate: PresentationNavigate
  params: PresentationParams
  structureParams: StructureDocumentPaneParams
  searchParams: PresentationSearchParams
}

export const PresentationContext = createContext<PresentationContextValue | null>(null)
