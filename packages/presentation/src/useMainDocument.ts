import type {ResponseQueryOptions} from '@sanity/client'
import {match, type Path} from 'path-to-regexp'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {useClient} from 'sanity'
import {useRouter} from 'sanity/router'

import {API_VERSION} from './constants'
import {useDocumentStore} from './internals'
import type {
  DocumentResolver,
  DocumentResolverContext,
  MainDocument,
  MainDocumentState,
  PresentationNavigate,
  PreviewUrlOption,
} from './types'

// Helper function to "unwrap" a result when it is either explicitly provided or
// returned as the result of a passed function
function fnOrObj<T, U>(arg: T | ((ctx: U) => T), context: U): T {
  return arg instanceof Function ? arg(context) : arg
}

function getQueryFromResult(
  resolver: DocumentResolver,
  context: DocumentResolverContext,
): string | undefined {
  if (resolver.resolve) {
    const filter = resolver.resolve(context)?.filter
    return filter ? `*[${filter}][0]{_id, _type}` : undefined
  }

  if ('type' in resolver) {
    return `*[_type == "${resolver.type}"][0]{_id, _type}`
  }

  return `*[${fnOrObj(resolver.filter, context)}][0]{_id, _type}`
}

function getParamsFromResult(
  resolver: DocumentResolver,
  context: DocumentResolverContext,
): Record<string, string> {
  if (resolver.resolve) {
    return resolver.resolve(context)?.params ?? context.params
  }

  if ('type' in resolver) {
    return {}
  }

  return fnOrObj(resolver.params, context) ?? context.params
}

export function getRouteContext(route: Path, url: URL): DocumentResolverContext | undefined {
  const routes = Array.isArray(route) ? route : [route]

  for (route of routes) {
    let origin: DocumentResolverContext['origin'] = undefined
    let path = route

    // Handle absolute URLs
    if (typeof route === 'string') {
      try {
        const absolute = new URL(route)
        origin = absolute.origin
        path = absolute.pathname
      } catch {
        // Ignore, as we assume a relative path
      }
    }

    // If an origin has been explicitly provided, check that it matches
    if (origin && url.origin !== origin) continue

    try {
      const matcher = match<Record<string, string>>(path, {decode: decodeURIComponent})
      const result = matcher(url.pathname)
      if (result) {
        const {params, path} = result
        return {origin, params, path}
      }
    } catch (e) {
      throw new Error(`"${route}" is not a valid route pattern`)
    }
  }
  return undefined
}

export function useMainDocument(props: {
  navigate?: PresentationNavigate
  path?: string
  previewUrl?: PreviewUrlOption
  resolvers?: DocumentResolver[]
}): MainDocumentState | undefined {
  const {navigate, resolvers = [], path, previewUrl} = props

  const {state: routerState} = useRouter()
  const documentStore = useDocumentStore()
  const client = useClient({apiVersion: API_VERSION})

  const [mainDocumentState, setMainDocumentState] = useState<MainDocumentState | undefined>(
    undefined,
  )
  const mainDocumentIdRef = useRef<string | undefined>(undefined)

  const url = useMemo(() => {
    const relativeUrl =
      path || routerState._searchParams?.find(([key]) => key === 'preview')?.[1] || ''

    const base =
      typeof previewUrl === 'string'
        ? previewUrl
        : typeof previewUrl === 'object'
          ? previewUrl?.origin || location.origin
          : location.origin

    return new URL(relativeUrl, base)
  }, [path, previewUrl, routerState._searchParams])

  const clearState = useCallback(() => {
    setMainDocumentState(undefined)
    mainDocumentIdRef.current = undefined
  }, [])

  useEffect(() => {
    if (resolvers.length && url) {
      let result:
        | {
            context: DocumentResolverContext
            resolver: DocumentResolver
          }
        | undefined

      for (const resolver of resolvers) {
        const context = getRouteContext(resolver.route, url)
        if (context) {
          result = {context, resolver}
          break
        }
      }

      if (result) {
        const query = getQueryFromResult(result.resolver, result.context)
        const params = getParamsFromResult(result.resolver, result.context)

        if (query) {
          const controller = new AbortController()
          const options: ResponseQueryOptions = {
            perspective: 'previewDrafts',
            signal: controller.signal,
          }

          client
            .fetch<MainDocument | undefined>(query, params, options)
            .then((doc) => {
              if (!doc || mainDocumentIdRef.current !== doc._id) {
                setMainDocumentState({
                  document: doc,
                  path: url.pathname,
                })
                navigate?.({
                  id: doc?._id,
                  type: doc?._type,
                })
                mainDocumentIdRef.current = doc?._id
              }
            })
            .catch((e) => {
              if (e instanceof Error && e.name === 'AbortError') return
              setMainDocumentState({document: undefined, path: url.pathname})
              mainDocumentIdRef.current = undefined
            })
          return () => {
            controller.abort()
          }
        }
      }
    }
    clearState()
    return undefined
  }, [client, clearState, documentStore, navigate, resolvers, url])

  return mainDocumentState
}
