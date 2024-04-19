import {createContext} from 'react'

import type {PresentationNavigate, PresentationParams, StructureDocumentPaneParams} from './types'

export interface PresentationContextValue {
  devMode: boolean
  name: string
  navigate: PresentationNavigate
  params: PresentationParams
  structureParams: StructureDocumentPaneParams
}

export const PresentationContext = createContext<PresentationContextValue | null>(null)
