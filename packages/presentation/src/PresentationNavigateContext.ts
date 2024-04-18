import {createContext} from 'react'

export type PresentationNavigateContextValue = (
  preview: string | undefined,
  document?: {type: string; id: string},
) => void

export const PresentationNavigateContext = createContext<PresentationNavigateContextValue | null>(
  null,
)
