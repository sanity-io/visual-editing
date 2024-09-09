import {useMemo, type FunctionComponent, type PropsWithChildren} from 'react'
import {PresentationContext, type PresentationContextValue} from './PresentationContext'
import type {
  PresentationNavigate,
  PresentationParams,
  PresentationSearchParams,
  StructureDocumentPaneParams,
} from './types'

export const PresentationProvider: FunctionComponent<
  PropsWithChildren<{
    devMode: boolean
    name: string
    navigate: PresentationNavigate
    params: PresentationParams
    searchParams: PresentationSearchParams
    structureParams: StructureDocumentPaneParams
  }>
> = function (props) {
  const {children, devMode, name, navigate, params, searchParams, structureParams} = props

  const context = useMemo<PresentationContextValue>(
    () => ({
      devMode,
      name,
      navigate,
      params,
      searchParams,
      structureParams,
    }),
    [devMode, name, navigate, params, searchParams, structureParams],
  )

  return <PresentationContext.Provider value={context}>{children}</PresentationContext.Provider>
}
