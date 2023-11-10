import { FunctionComponent, PropsWithChildren, useMemo } from 'react'

import {
  PresentationContext,
  PresentationContextValue,
} from './PresentationContext'
import {
  DeskDocumentPaneParams,
  PresentationParams,
  SetPresentationParams,
} from './types'

export const PresentationProvider: FunctionComponent<
  PropsWithChildren<{
    deskParams: DeskDocumentPaneParams
    devMode: boolean
    name: string
    params: PresentationParams
    setParams: SetPresentationParams
  }>
> = function (props) {
  const { children, deskParams, devMode, name, params, setParams } = props

  const context = useMemo<PresentationContextValue>(
    () => ({
      deskParams,
      devMode,
      name,
      params,
      setParams,
    }),
    [deskParams, devMode, name, params, setParams],
  )

  return (
    <PresentationContext.Provider value={context}>
      {children}
    </PresentationContext.Provider>
  )
}
