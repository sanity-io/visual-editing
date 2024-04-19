import {type FunctionComponent, type PropsWithChildren, useMemo} from 'react'

import {PresentationContext, type PresentationContextValue} from './PresentationContext'
import type {PresentationNavigate, PresentationParams, StructureDocumentPaneParams} from './types'

export const PresentationProvider: FunctionComponent<
  PropsWithChildren<{
    devMode: boolean
    name: string
    navigate: PresentationNavigate
    params: PresentationParams
    structureParams: StructureDocumentPaneParams
  }>
> = function (props) {
  const {children, devMode, name, navigate, params, structureParams} = props

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

  return <PresentationContext.Provider value={context}>{children}</PresentationContext.Provider>
}
