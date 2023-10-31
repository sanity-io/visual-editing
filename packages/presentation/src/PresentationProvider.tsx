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
    params: PresentationParams
  }>
> = function (props) {
  const { children, deskParams, devMode, params } = props

  const context = useMemo<PresentationContextValue>(
    () => ({
      deskParams,
      devMode,
      params,
    }),
    [deskParams, devMode, params],
  )

  return (
    <PresentationContext.Provider value={context}>
      {children}
    </PresentationContext.Provider>
  )
}
