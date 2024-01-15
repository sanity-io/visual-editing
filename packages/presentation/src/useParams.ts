import { MutableRefObject, useEffect, useMemo, useRef } from 'react'
import { RouterContextValue, RouterState, SearchParam } from 'sanity/router'

import { debounce } from './lib/debounce'
import { parseRouterState } from './lib/parse'
import {
  DeskDocumentPaneParams,
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
  previewRef,
}: {
  initialPreviewUrl: URL
  routerNavigate: RouterContextValue['navigate']
  routerState: RouterState & PresentationStateParams
  routerSearchParams: {
    [k: string]: string
  }
  previewRef: MutableRefObject<string | undefined>
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
      inspect: routerSearchParams.inspect,
      rev: routerSearchParams.rev,
      since: routerSearchParams.since,
      template: routerSearchParams.template,
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
      view: params.view,
      // assist
      pathKey: params.pathKey,
      instruction: params.instruction,
      // comments
      comment: params.comment,
    })
    return pruned
  }, [
    params.inspect,
    params.path,
    params.rev,
    params.since,
    params.template,
    params.view,
    params.pathKey,
    params.instruction,
    params.comment,
  ])

  const routerStateRef = useRef(routerState)

  useEffect(() => {
    routerStateRef.current = routerState
  }, [routerState])

  const navigate = useMemo(
    () =>
      debounce<PresentationNavigate>(
        (nextState, nextSearchState = {}, forceReplace) => {
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

          state._searchParams = Object.entries(searchState).reduce(
            (acc, [key, value]) => [...acc, [key, value]],
            [] as SearchParam[],
          )

          const replace =
            forceReplace ?? searchState.preview === previewRef.current

          routerNavigate(state, { replace })
        },
        50,
      ),
    [routerNavigate, previewRef],
  )

  return {
    deskParams,
    navigate,
    params,
  }
}
