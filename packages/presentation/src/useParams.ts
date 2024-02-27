import { MutableRefObject, useEffect, useMemo, useRef } from 'react'
import { getPublishedId } from 'sanity'
import { RouterContextValue, RouterState, SearchParam } from 'sanity/router'

import { debounce } from './lib/debounce'
import { parseRouterState } from './lib/parse'
import {
  DeskDocumentPaneParams,
  FrameState,
  PresentationNavigate,
  PresentationParams,
  PresentationSearchParams,
  PresentationStateParams,
} from './types'

function pruneObject<T extends RouterState | PresentationParams>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, value]) => value !== undefined && value !== '' && value !== null,
    ),
  ) as T
}

export function useParams({
  initialPreviewUrl,
  routerNavigate,
  routerState,
  routerSearchParams,
  frameStateRef,
}: {
  initialPreviewUrl: URL
  routerNavigate: RouterContextValue['navigate']
  routerState: RouterState & PresentationStateParams
  routerSearchParams: {
    [k: string]: string
  }
  frameStateRef: MutableRefObject<FrameState>
}): {
  deskParams: DeskDocumentPaneParams
  navigate: PresentationNavigate
  params: PresentationParams
} {
  const params = useMemo<PresentationParams>(() => {
    const { id, path, type } = parseRouterState(routerState)

    return {
      id,
      type,
      path,
      preview:
        routerSearchParams.preview ||
        `${initialPreviewUrl.pathname}${initialPreviewUrl.search}`,
      perspective: routerSearchParams.perspective,
      viewport: routerSearchParams.viewport,
      inspect: routerSearchParams.inspect,
      rev: routerSearchParams.rev,
      since: routerSearchParams.since,
      template: routerSearchParams.template,
      templateParams: routerSearchParams.templateParams,
      view: routerSearchParams.view,
      // assist
      pathKey: routerSearchParams.pathKey,
      instruction: routerSearchParams.instruction,
      // comments
      comment: routerSearchParams.comment,
    }
  }, [routerState, routerSearchParams, initialPreviewUrl])

  const deskParams = useMemo<DeskDocumentPaneParams>(() => {
    const pruned = pruneObject({
      inspect: params.inspect,
      path: params.path,
      rev: params.rev,
      since: params.since,
      template: params.template,
      templateParams: params.templateParams,
      view: params.view,
      // assist
      pathKey: params.pathKey,
      instruction: params.instruction,
      // comments
      comment: params.comment,
    })
    return pruned
  }, [
    params.comment,
    params.inspect,
    params.instruction,
    params.path,
    params.pathKey,
    params.rev,
    params.since,
    params.template,
    params.templateParams,
    params.view,
  ])

  const routerStateRef = useRef(routerState)

  useEffect(() => {
    routerStateRef.current = routerState
  }, [routerState])

  const navigate = useMemo(
    () =>
      debounce<PresentationNavigate>(
        (nextState, nextSearchState = {}, forceReplace) => {
          // Force navigation to use published IDs only
          if (nextState.id) nextState.id = getPublishedId(nextState.id)

          // Extract type, id and path as 'routerState'
          const { _searchParams: routerSearchParams, ...routerState } =
            routerStateRef.current

          // Convert array of search params to an object
          const routerSearchState = (routerSearchParams || []).reduce(
            (acc, [key, value]) => (
              (acc[key as keyof PresentationSearchParams] = value), acc
            ),
            {} as PresentationSearchParams,
          )

          // Merge routerState and incoming state
          const state: RouterState = pruneObject({
            ...routerState,
            ...nextState,
          })

          // Merge routerSearchState and incoming searchState
          const searchState = pruneObject({
            ...routerSearchState,
            ...nextSearchState,
          })

          // If the document has changed, clear the template and templateParams
          if (routerState.id !== state.id) {
            delete searchState.template
            delete searchState.templateParams
          }

          state._searchParams = Object.entries(searchState).reduce(
            (acc, [key, value]) => [...acc, [key, value]],
            [] as SearchParam[],
          )

          const replace =
            forceReplace ?? searchState.preview === frameStateRef.current.url

          routerNavigate(state, { replace })
        },
        50,
      ),
    [routerNavigate, frameStateRef],
  )

  return {
    deskParams,
    navigate,
    params,
  }
}
