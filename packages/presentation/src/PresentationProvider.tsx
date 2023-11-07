import { FunctionComponent, PropsWithChildren, useMemo } from 'react'

import {
  PresentationContext,
  PresentationContextValue,
} from './PresentationContext'
import { DeskDocumentPaneParams, PresentationParams } from './types'

export const PresentationProvider: FunctionComponent<
  PropsWithChildren<{
    deskParams: DeskDocumentPaneParams
    devMode: boolean
    name: string
    params: PresentationParams
  }>
> = function (props) {
  const { children, deskParams, devMode, name, params } = props

  const context = useMemo<PresentationContextValue>(
    () => ({
      deskParams,
      devMode,
      name,
      params,
    }),
    [deskParams, devMode, name, params],
  )

  return (
    <PresentationContext.Provider value={context}>
      {children}
    </PresentationContext.Provider>
  )
}
