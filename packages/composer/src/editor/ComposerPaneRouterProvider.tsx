/* eslint-disable no-console */

import { forwardRef, PropsWithChildren, ReactElement, useMemo } from 'react'
import { getPublishedId } from 'sanity'
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
  const { documentId, documentType, ...restProps } = props

  return (
    <StateLink
      {...restProps}
      ref={ref}
      state={{ path: documentId, type: documentType }}
      title={undefined}
    />
  )
})

export function ComposerPaneRouterProvider(
  props: PropsWithChildren<{
    onDeskParams: (params: DeskDocumentPaneParams) => void
    params: DeskDocumentPaneParams
    previewUrl?: string
    refs?: { _id: string; _type: string }[]
  }>,
): ReactElement {
  const { children, params, onDeskParams, previewUrl, refs } = props

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
      ChildLink: (childLinkProps) => {
        const { childId, ...restProps } = childLinkProps
        const ref = refs?.find((r) => getPublishedId(r._id) === childId)

        if (ref) {
          return (
            <StateLink
              {...restProps}
              searchParams={{ preview: previewUrl }}
              state={{ path: ref._id, type: ref._type }}
            />
          )
        }

        return <div {...restProps} />
      },
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
          // eslint-disable-next-line no-warning-comments
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
  }, [onDeskParams, params, previewUrl, refs])

  return (
    <PaneRouterContext.Provider value={context}>
      {children}
    </PaneRouterContext.Provider>
  )
}
