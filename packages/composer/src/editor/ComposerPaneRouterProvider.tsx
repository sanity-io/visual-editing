/* eslint-disable no-console */

import { forwardRef, ReactElement, ReactNode, useMemo } from 'react'
import {
  BackLinkProps,
  PaneRouterContext,
  PaneRouterContextValue,
  ReferenceChildLinkProps,
} from 'sanity/desk'
// import { StateLink } from 'sanity/router'

const BackLink = forwardRef(function BackLink(
  props: BackLinkProps,
  ref: React.ForwardedRef<HTMLAnchorElement>,
) {
  return <a {...props} ref={ref} />

  // return (
  //   <StateLink
  //     {...props}
  //     ref={ref}
  //     state={{ type: undefined }}
  //     title={undefined}
  //   />
  // )
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

export function ComposerPaneRouterProvider(props: {
  children: ReactNode
}): ReactElement {
  const { children } = props

  const context: PaneRouterContextValue = useMemo(() => {
    return {
      index: 0,
      groupIndex: 0,
      siblingIndex: 0,
      payload: {},
      params: {},
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
      setParams: () => {
        // eslint-disable-next-line no-warning-comments
        // todo
      },
      setPayload: (payload) => {
        console.warn('setPayload', payload)
      },
      navigateIntent: (intentName, intentParams, options) => {
        console.warn('navigateIntent', intentName, intentParams, options)
      },
    }
  }, [])

  return (
    <PaneRouterContext.Provider value={context}>
      {children}
    </PaneRouterContext.Provider>
  )
}
