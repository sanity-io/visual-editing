import { FunctionComponent, PropsWithChildren, useMemo } from 'react'

import {
  PresentationContext,
  PresentationContextValue,
} from './PresentationContext'
import {
  PresentationNavigate,
  PresentationParams,
  StructureDocumentPaneParams,
} from './types'

export const PresentationProvider: FunctionComponent<
  PropsWithChildren<{
    devMode: boolean
    name: string
    navigate: PresentationNavigate
    params: PresentationParams
    structureParams: StructureDocumentPaneParams
  }>
> = function (props) {
  const { children, devMode, name, navigate, params, structureParams } = props

  const context = useMemo<PresentationContextValue>(
    () => ({
      devMode,
      name,
      navigate,
      params,
      structureParams,
    }),
    [devMode, name, navigate, params, structureParams],
  )

  return (
    <PresentationContext.Provider value={context}>
      {children}
    </PresentationContext.Provider>
  )
}
