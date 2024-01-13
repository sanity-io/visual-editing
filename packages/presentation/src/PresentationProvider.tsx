import { FunctionComponent, PropsWithChildren, useMemo } from 'react'

import {
  PresentationContext,
  PresentationContextValue,
} from './PresentationContext'
import {
  DeskDocumentPaneParams,
  PresentationNavigate,
  PresentationParams,
} from './types'

export const PresentationProvider: FunctionComponent<
  PropsWithChildren<{
    deskParams: DeskDocumentPaneParams
    devMode: boolean
    name: string
    navigate: PresentationNavigate
    params: PresentationParams
  }>
> = function (props) {
  const { children, deskParams, devMode, name, navigate, params } = props

  const context = useMemo<PresentationContextValue>(
    () => ({
      deskParams,
      devMode,
      name,
      navigate,
      params,
    }),
    [deskParams, devMode, name, navigate, params],
  )

  return (
    <PresentationContext.Provider value={context}>
      {children}
    </PresentationContext.Provider>
  )
}
