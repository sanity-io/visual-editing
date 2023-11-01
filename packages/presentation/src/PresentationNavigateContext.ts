import { createContext } from 'react'

export type PresentationNavigateContextValue = (preview: string) => void

export const PresentationNavigateContext =
  createContext<PresentationNavigateContextValue | null>(null)
