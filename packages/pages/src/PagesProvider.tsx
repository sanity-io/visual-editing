import { FunctionComponent, PropsWithChildren, useMemo } from 'react'

import { PagesContext, PagesContextValue } from './PagesContext'
import { DeskDocumentPaneParams, PagesParams } from './types'

export const PagesProvider: FunctionComponent<
  PropsWithChildren<{
    deskParams: DeskDocumentPaneParams
    devMode: boolean
    params: PagesParams
  }>
> = function (props) {
  const { children, deskParams, devMode, params } = props

  const context = useMemo<PagesContextValue>(
    () => ({
      deskParams,
      devMode,
      params,
    }),
    [deskParams, devMode, params],
  )

  return (
    <PagesContext.Provider value={context}>{children}</PagesContext.Provider>
  )
}
