import { createContext } from 'react'

export type ComposerNavigateContextValue = (preview: string) => void

export const ComposerNavigateContext =
  createContext<ComposerNavigateContextValue | null>(null)
