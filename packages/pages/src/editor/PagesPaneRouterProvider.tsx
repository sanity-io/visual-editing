/* eslint-disable no-console */

import {
  forwardRef,
  PropsWithChildren,
  ReactElement,
  useCallback,
  useMemo,
} from 'react'
import { getPublishedId } from 'sanity'
import {
  BackLinkProps,
  PaneRouterContext,
  PaneRouterContextValue,
  ReferenceChildLinkProps,
} from 'sanity/desk'
import { StateLink, useRouter } from 'sanity/router'

import { DeskDocumentPaneParams, PagesParams } from '../types'
import { usePagesTool } from '../usePagesTool'

function encodeQueryString(params: Record<string, unknown> = {}): string {
  const parts = Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join('&')

  return parts.length ? `?${parts}` : ''
}

function resolveQueryStringFromParams(
  nextParams: Record<string, string | undefined>,
) {
  const allowed = [
    'comment',
    'inspect',
    'instruction',
    'pathKey',
    'rev',
    'since',
    'template',
    'view',
  ] satisfies Array<keyof PagesParams> as string[]

  const safeNextParams = Object.entries(nextParams)
    .filter(([key]) => allowed.includes(key))
    .reduce((obj, [key, value]) => {
      if (value == undefined) return obj
      return { ...obj, [key]: value }
    }, {})

  return encodeQueryString(safeNextParams)
}

const BackLink = forwardRef(function BackLink(
  props: BackLinkProps,
  ref: React.ForwardedRef<HTMLAnchorElement>,
) {
  const { deskParams, params } = usePagesTool()

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

export function PagesPaneRouterProvider(
  props: PropsWithChildren<{
    onDeskParams: (params: DeskDocumentPaneParams) => void
    params: DeskDocumentPaneParams
    previewUrl?: string
    refs?: { _id: string; _type: string }[]
  }>,
): ReactElement {
  const { children, params, onDeskParams, previewUrl, refs } = props

  const {
    state: routerState,
    searchParams: routerSearchParams,
    resolvePathFromState,
  } = useRouter()

  const createPathWithParams: PaneRouterContextValue['createPathWithParams'] =
    useCallback(
      (nextParams) => {
        const path = resolvePathFromState(routerState)
        const qs = resolveQueryStringFromParams({
          ...routerSearchParams,
          ...nextParams,
        })
        return `${path}${qs}`
      },
      [resolvePathFromState, routerSearchParams, routerState],
    )

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
          // @todo set inspect param to undefined manually as param is missing from object when closing inspector
          inspect: nextParams.inspect ?? undefined,
        } as DeskDocumentPaneParams)
      },
      setPayload: (payload) => {
        console.warn('setPayload', payload)
      },
      navigateIntent: (intentName, intentParams, options) => {
        console.warn('navigateIntent', intentName, intentParams, options)
      },
      createPathWithParams,
    }
  }, [createPathWithParams, onDeskParams, params, previewUrl, refs])

  return (
    <PaneRouterContext.Provider value={context}>
      {children}
    </PaneRouterContext.Provider>
  )
}
