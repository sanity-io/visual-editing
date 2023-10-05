/* eslint-disable no-console */

import { forwardRef, PropsWithChildren, ReactElement, useMemo } from 'react'
import {
  BackLinkProps,
  PaneRouterContext,
  PaneRouterContextValue,
  ReferenceChildLinkProps,
} from 'sanity/desk'
import { StateLink } from 'sanity/router'

import { DeskDocumentPaneParams } from '../types'
import { useComposer } from '../useComposer'

const BackLink = forwardRef(function BackLink(
  props: BackLinkProps,
  ref: React.ForwardedRef<HTMLAnchorElement>,
) {
  const { deskParams, params } = useComposer()

  return (
    <StateLink
      {...props}
      ref={ref}
      searchParams={{ ...deskParams, preview: params.preview }}
      state={{ type: undefined }}
      title={undefined}
    />
  )
})

const ReferenceChildLink = forwardRef(function ReferenceChildLink(
  props: ReferenceChildLinkProps,
  ref: React.ForwardedRef<HTMLAnchorElement>,
) {
  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    documentId,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    documentType,
    ...restProps
  } = props

  return <a {...restProps} ref={ref} />

  // return (
  //   <StateLink
  //     {...restProps}
  //     ref={ref}
  //     state={{ path: documentId, type: documentType }}
  //     title={undefined}
  //   />
  // )
})

export function ComposerPaneRouterProvider(
  props: PropsWithChildren<{
    params: DeskDocumentPaneParams
    onDeskParams: (params: DeskDocumentPaneParams) => void
  }>,
): ReactElement {
  const { children, params, onDeskParams } = props

  const context: PaneRouterContextValue = useMemo(() => {
    return {
      index: 0,
      groupIndex: 0,
      siblingIndex: 0,
      payload: {},
      params: params as any,
      hasGroupSiblings: false,
      groupLength: 1,
      routerPanesState: [],
      ChildLink: () => <>ChildLink</>,
      BackLink,
      ReferenceChildLink,
      ParameterizedLink: () => <>ParameterizedLink</>,
      closeCurrentAndAfter: () => {
        console.warn('closeCurrentAndAfter')
      },
      handleEditReference: (options) => {
        console.warn('handleEditReference', options)
      },
      replaceCurrent: (pane) => {
        console.warn('replaceCurrent', pane)
      },
      closeCurrent: () => {
        console.warn('closeCurrent')
      },
      duplicateCurrent: (pane) => {
        console.warn('duplicateCurrent', pane)
      },
      setView: (viewId) => {
        console.warn('setView', viewId)
      },
      setParams: (nextParams) => {
        onDeskParams({
          ...nextParams,
          // @todo inspect param set manually as it does not seem to be returned
          inspect: nextParams.inspect ?? undefined,
        } as DeskDocumentPaneParams)
      },
      setPayload: (payload) => {
        console.warn('setPayload', payload)
      },
      navigateIntent: (intentName, intentParams, options) => {
        console.warn('navigateIntent', intentName, intentParams, options)
      },
    }
  }, [onDeskParams, params])

  return (
    <PaneRouterContext.Provider value={context}>
      {children}
    </PaneRouterContext.Provider>
  )
}
