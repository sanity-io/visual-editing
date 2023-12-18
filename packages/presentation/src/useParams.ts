import { studioPath } from '@sanity/client/csm'
import { pathToUrlString } from '@sanity/visual-editing-helpers'
import isEqual from 'lodash.isequal'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { NavigateOptions, RouterContextValue, RouterState } from 'sanity/router'

import { debounce } from './lib/debounce'
import { parseRouterState } from './lib/parse'
import {
  DeskDocumentPaneParams,
  PresentationParams,
  PresentationStateParams,
  SetPresentationParams,
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
}: {
  initialPreviewUrl: URL
  routerNavigate: RouterContextValue['navigate']
  routerState: PresentationStateParams
  routerSearchParams: {
    [k: string]: string
  }
}): {
  deskParams: DeskDocumentPaneParams
  navigate: (nextState: RouterState, options?: NavigateOptions) => void
  params: PresentationParams
  setParams: SetPresentationParams
} {
  const [params, setParamsState] = useState<PresentationParams>(() => {
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
  })

  const setParams = useCallback((newParams: Partial<PresentationParams>) => {
    setParamsState((state) => {
      const nextState = { ...state, ...newParams }
      if (isEqual(pruneObject(state), pruneObject(nextState))) {
        return state
      }
      return nextState
    })
  }, [])

  const deskParams = useMemo<DeskDocumentPaneParams>(
    () =>
      pruneObject({
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
      }),
    [
      params.inspect,
      params.path,
      params.rev,
      params.since,
      params.template,
      params.view,
      params.pathKey,
      params.instruction,
      params.comment,
    ],
  )

  useEffect(() => {
    const { id, path, type } = parseRouterState(routerState)

    const timeout = setTimeout(
      () =>
        setParams({
          id,
          type: type === '*' ? undefined : type,
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
        }),
      0,
    )
    return () => clearTimeout(timeout)
  }, [initialPreviewUrl, routerSearchParams, routerState, setParams])

  const navigate = useMemo(() => {
    // Debounce navigation to mitigate various event related race conditions
    return debounce((nextState: RouterState, options?: NavigateOptions) => {
      const state = pruneObject(nextState)
      routerNavigate(state, options)
    }, 50)
  }, [routerNavigate])

  const previewRef = useRef(params.preview)

  useEffect(() => {
    const previousPreview = previewRef.current
    previewRef.current = params.preview

    const type = params.type
    const id = params.id
    const path = params.path
      ? pathToUrlString(studioPath.fromString(params.path))
      : undefined

    const searchParams = pruneObject({
      preview: params.preview,
      perspective: params.perspective === 'published' ? 'published' : undefined,
      inspect: params.inspect,
      rev: params.rev,
      since: params.since,
      template: params.template,
      view: params.view,
      // assist
      pathKey: params.pathKey,
      instruction: params.instruction,
      // comments
      comment: params.comment,
    }) satisfies PresentationParams

    const replace = params.preview === previousPreview
    const timeout = setTimeout(
      () =>
        navigate(
          {
            type,
            id,
            path,
            _searchParams: Object.entries(
              searchParams as Record<string, string>,
            ),
          },
          { replace },
        ),
      0,
    )
    return () => clearTimeout(timeout)
  }, [navigate, params])

  return {
    navigate,
    setParams,
    deskParams,
    params,
  }
}
