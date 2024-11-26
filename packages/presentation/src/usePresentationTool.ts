import {useContext} from 'react'
import {PresentationContext, type PresentationContextValue} from './PresentationContext'

export function usePresentationTool(throwOnMissingContext?: true): PresentationContextValue
export function usePresentationTool(throwOnMissingContext: false): PresentationContextValue | null
export function usePresentationTool(throwOnMissingContext = true): PresentationContextValue | null {
  const presentation = useContext(PresentationContext)

  if (throwOnMissingContext && !presentation) {
    throw new Error('Presentation context is missing')
  }

  return presentation
}
