import { useEffect, useMemo, useRef, useState } from 'react'
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
  ComposerParams,
  ComposerStateParams,
  DeskDocumentPaneParams,
  SetComposerParams,
} from './types'

export function useComposerParams(): {
  deskParams: DeskDocumentPaneParams
  navigate: (nextState: RouterState, options?: NavigateOptions) => void
  params: ComposerParams
  setParams: SetComposerParams
} {
  const {
    navigate: routerNavigate,
    searchParams: routerSearchParams,
    state: routerState,
  } = useRouter() as RouterContextValue & { state: ComposerStateParams }

  const [params, setParams] = useState<ComposerParams>(() => {
    const { id, path } = parsePath(
      routerState.path && decodeURIComponent(routerState.path),
    )
    return {
      id,
      type: routerState.type,
      path,
      preview: routerSearchParams.preview || '/', // @todo
      inspect: routerSearchParams.inspect,
      rev: routerSearchParams.rev,
      since: routerSearchParams.since,
      template: routerSearchParams.template,
      view: routerSearchParams.view,
    }
  })

  const deskParams = useMemo<DeskDocumentPaneParams>(
    () => ({
      inspect: params.inspect,
      path: params.path,
      rev: params.rev,
      since: params.since,
      template: params.template,
      view: params.view,
    }),
    [
      params.inspect,
      params.path,
      params.rev,
      params.since,
      params.template,
      params.view,
    ],
  )

  useEffect(() => {
    const { type } = routerState
    // decodeURI param in path?
    const { id, path } = parsePath(routerState.path)

    setParams(() => {
      return {
        id,
        type: type === '*' ? undefined : type,
        path,
        preview: routerSearchParams.preview || '/', // @todo
        inspect: routerSearchParams.inspect,
        rev: routerSearchParams.rev,
        since: routerSearchParams.since,
        template: routerSearchParams.template,
        view: routerSearchParams.view,
      }
    })
  }, [routerSearchParams, routerState, setParams])

  const navigate = useMemo(() => {
    // Debounce navigation to mitigate various event related race conditions
    return debounce((nextState: RouterState, options?: NavigateOptions) => {
      routerNavigate(nextState, options)
    }, 50)
  }, [routerNavigate])

  const paramsRef = useRef(params)

  useEffect(() => {
    const prevParams = {
      ...paramsRef.current,
      path: [paramsRef.current.id, paramsRef.current.path].join('.'),
    }
    // @todo improve comparison
    if (params.type === prevParams.type && params.path === prevParams.path) {
      return
    }

    paramsRef.current = params

    const type = params.type || '*'
    const path = params.id
      ? pathToUrlString(
          stringToPath([params.id, params.path].filter(Boolean).join('.')),
        )
      : undefined
    const replace = params.preview === prevParams.preview
    navigate({ type, path }, { replace })
  }, [navigate, params])

  return {
    navigate,
    setParams,
    deskParams,
    params,
  }
}
