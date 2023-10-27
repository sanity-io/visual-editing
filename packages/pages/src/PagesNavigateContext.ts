import { createContext } from 'react'

export type PagesNavigateContextValue = (preview: string) => void

export const PagesNavigateContext =
  createContext<PagesNavigateContextValue | null>(null)
