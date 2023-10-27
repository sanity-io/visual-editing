import isEqual from 'lodash.isequal'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { stringToPath } from 'sanity'
import {
  NavigateOptions,
  RouterContextValue,
  RouterState,
  useRouter,
} from 'sanity/router'
import { pathToUrlString } from 'visual-editing-helpers'

import { debounce } from './lib/debounce'
import { parsePath } from './parsePath'
import {
  DeskDocumentPaneParams,
  PagesParams,
  PagesStateParams,
  SetPagesParams,
} from './types'

function pruneObject<T extends RouterState | PagesParams>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, value]) => value !== undefined && value !== '',
    ),
  ) as T
}

export function useParams({ previewUrl }: { previewUrl: string }): {
  defaultPreviewUrl: URL
  deskParams: DeskDocumentPaneParams
  navigate: (nextState: RouterState, options?: NavigateOptions) => void
  params: PagesParams
  setParams: SetPagesParams
} {
  const {
    navigate: routerNavigate,
    searchParams: routerSearchParams,
    state: routerState,
  } = useRouter() as RouterContextValue & { state: PagesStateParams }

  const defaultPreviewUrl = useMemo(
    () => new URL(previewUrl, window.location.origin),
    [previewUrl],
  )

  const [params, setParamsState] = useState<PagesParams>(() => {
    const { id, path } = parsePath(
      routerState.path && decodeURIComponent(routerState.path),
    )
    return {
      id,
      type: routerState.type,
      path,
      preview: routerSearchParams.preview || defaultPreviewUrl.pathname,
      inspect: routerSearchParams.inspect,
      rev: routerSearchParams.rev,
      since: routerSearchParams.since,
      template: routerSearchParams.template,
      view: routerSearchParams.view,
      // assist
      pathKey: routerSearchParams.pathKey,
      instruction: routerSearchParams.instruction,
    }
  })

  const setParams = useCallback((newParams: Partial<PagesParams>) => {
    setParamsState((state) => {
      const nextState = { ...state, ...newParams }
      if (isEqual(pruneObject(state), pruneObject(nextState))) {
        return state
      }
      return nextState
    })
  }, [])

  const deskParams = useMemo<DeskDocumentPaneParams>(
    () => ({
      inspect: params.inspect,
      path: params.path,
      rev: params.rev,
      since: params.since,
      template: params.template,
      view: params.view,
      // assist
      pathKey: params.pathKey,
      instruction: params.instruction,
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
    ],
  )

  useEffect(() => {
    const { type } = routerState
    // decodeURI param in path?
    const { id, path } = parsePath(routerState.path)

    setParams({
      id,
      type: type === '*' ? undefined : type,
      path,
      preview: routerSearchParams.preview || defaultPreviewUrl.pathname,
      inspect: routerSearchParams.inspect,
      rev: routerSearchParams.rev,
      since: routerSearchParams.since,
      template: routerSearchParams.template,
      view: routerSearchParams.view,
      // assist
      pathKey: routerSearchParams.pathKey,
      instruction: routerSearchParams.instruction,
    })
  }, [defaultPreviewUrl, routerSearchParams, routerState, setParams])

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
    const path = params.id
      ? pathToUrlString(
          stringToPath([params.id, params.path].filter(Boolean).join('.')),
        )
      : undefined

    const searchParams = {
      preview: params.preview,
      inspect: params.inspect,
      rev: params.rev,
      since: params.since,
      template: params.template,
      view: params.view,
      pathKey: params.pathKey,
      instruction: params.instruction,
    } as DeskDocumentPaneParams as Record<string, string>

    const replace = params.preview === previousPreview
    navigate({ type, path }, { replace, searchParams })
  }, [navigate, params])

  return {
    defaultPreviewUrl,
    navigate,
    setParams,
    deskParams,
    params,
  }
}
