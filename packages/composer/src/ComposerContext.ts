import { createContext } from 'react'

import { ComposerParams, DeskDocumentPaneParams } from './types'

export interface ComposerContextValue {
  params: ComposerParams
  deskParams: DeskDocumentPaneParams
}

export const ComposerContext = createContext<ComposerContextValue | null>(null)
