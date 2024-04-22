import type {ResponseQueryOptions} from '@sanity/client'
import {match} from 'path-to-regexp'
import {useEffect, useMemo, useState} from 'react'
import {useClient, useDocumentStore} from 'sanity'
import {useRouter} from 'sanity/router'

import {API_VERSION} from './constants'
import type {
  DocumentResolver,
  DocumentResolverContext,
  DocumentResolverDefinition,
  MainDocument,
  MainDocumentState,
  PreviewUrlOption,
} from './types'

export type MainDocumentResolverDefinition = Required<
  Pick<DocumentResolverDefinition, 'path' | 'mainDocument'>
>

// Helper function to "unwrap" a result when it is either explicitly provided or
// returned as the result of a passed function
function fnOrObj<T, U>(arg: T | ((ctx: U) => T), context: U): T {
  return arg instanceof Function ? arg(context) : arg
}

function getQueryFromResult(
  resolver: DocumentResolver,
  context: DocumentResolverContext,
): string | undefined {
  if (typeof resolver === 'function') {
    const filter = resolver(context)?.filter
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
  if (typeof resolver === 'function') {
    return resolver(context)?.params ?? context.params
  }

  if ('type' in resolver) {
    return {}
  }

  return fnOrObj(resolver.params, context) ?? context.params
}

export function useMainDocument(props: {
  path?: string
  previewUrl?: PreviewUrlOption
  resolvers: MainDocumentResolverDefinition[]
}): MainDocumentState | undefined {
  const {resolvers, path, previewUrl} = props

  const {state: routerState} = useRouter()
  const documentStore = useDocumentStore()
  const client = useClient({apiVersion: API_VERSION})

  const [mainDocumentState, setMainDocumentState] = useState<MainDocumentState | undefined>(
    undefined,
  )

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
  }, [path, previewUrl, routerState])

  useEffect(() => {
    setMainDocumentState(undefined)

    if (!resolvers.length || !url) return undefined
    const controller = new AbortController()

    // const resolvers = Object.entries(resolver)

    let result:
      | {
          context: DocumentResolverContext
          resolver: MainDocumentResolverDefinition
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
      const query = getQueryFromResult(result.resolver.mainDocument, result.context)
      const params = getParamsFromResult(result.resolver.mainDocument, result.context)

      if (query) {
        const options: ResponseQueryOptions = {
          perspective: 'previewDrafts',
          signal: controller.signal,
        }

        client
          .fetch<MainDocument>(query, params, options)
          .then((doc) => setMainDocumentState({document: doc || undefined}))
          .catch((e) => {
            if (e instanceof Error && e.name === 'AbortError') return
          })
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

    // return () => {}
    return () => {
      controller.abort()
    }
  }, [client, documentStore, resolvers, url])

  return mainDocumentState
}
