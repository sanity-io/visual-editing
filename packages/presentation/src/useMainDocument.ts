import type {ResponseQueryOptions} from '@sanity/client'
import {match} from 'path-to-regexp'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {useClient, useDocumentStore} from 'sanity'
import {useRouter} from 'sanity/router'

import {API_VERSION} from './constants'
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
          ? previewUrl?.origin
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
        try {
          const _result = match<Record<string, string>>(resolver.path, {
            decode: decodeURIComponent,
          })(url.pathname)
          if (_result) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const {index, ...context} = _result
            result = {context, resolver}
            break
          }
        } catch (e) {
          throw new Error(`"${resolver.path}" is not a valid path pattern`)
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

      // if (result) {
      //   const query =
      //     typeof result === 'string'
      //       ? `*[_type == "${result}"][0]{_id, _type}`
      //       : `*[${result.filter}][0]{_id, _type}`
      //   const params = typeof result === 'string' ? {} : result.params || {}
      //   const options = { signal: controller.signal }

      //   // setFetching(true)
      //   // const doc$ = documentStore.listenQuery(query, params, {
      //   //   perspective: 'previewDrafts',
      //   // }) as Observable<SanityDocument | null>

      //   // const sub = doc$.subscribe((d) => {
      //   //   console.log('set main document')
      //   //   setFetching(false)
      //   //   setMainDocument(d || undefined)
      //   // })

      //   // // const locations$ = doc$.pipe(map(locate.resolve))

      //   // return () => {
      //   //   sub.unsubscribe()
      //   // }
      //   // setMainDocument(undefined)
    }
    clearState()
    return undefined
  }, [client, clearState, documentStore, navigate, resolvers, url])

  return mainDocumentState
}
