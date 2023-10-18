import { createContext } from 'react'

import { ComposerParams, DeskDocumentPaneParams } from './types'

export interface ComposerContextValue {
  deskParams: DeskDocumentPaneParams
  devMode: boolean
  params: ComposerParams
}

export const ComposerContext = createContext<ComposerContextValue | null>(null)
