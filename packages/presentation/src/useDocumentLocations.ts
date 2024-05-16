import {useEffect, useMemo, useState} from 'react'
import {isObservable, map, type Observable, of} from 'rxjs'
import {type SanityDocument} from 'sanity'

import {useDocumentStore} from './internals'
import type {
  DocumentLocationResolver,
  DocumentLocationResolvers,
  DocumentLocationsState,
  DocumentLocationsStatus,
} from './types'

const INITIAL_STATE: DocumentLocationsState = {locations: []}

export function useDocumentLocations(props: {
  id: string
  resolvers?: DocumentLocationResolver | DocumentLocationResolvers
  type: string
}): {
  state: DocumentLocationsState
  status: DocumentLocationsStatus
} {
  const {id, resolvers, type} = props
  const documentStore = useDocumentStore()
  const [locationsState, setLocationsState] = useState<DocumentLocationsState>(INITIAL_STATE)

  const resolver = resolvers && (typeof resolvers === 'function' ? resolvers : resolvers[type])

  const [locationsStatus, setLocationsStatus] = useState<DocumentLocationsStatus>(
    resolver ? 'resolving' : 'empty',
  )

  const result = useMemo(() => {
    if (!resolver) return undefined

    // Original/advanced resolver which requires explicit use of Observables
    if (typeof resolver === 'function') {
      const params = {id, type}
      const context = {documentStore}
      const _result = resolver(params, context)
      return isObservable(_result) ? _result : of(_result)
    }

    // Simplified resolver pattern which abstracts away Observable logic
    if ('select' in resolver && 'resolve' in resolver) {
      const projection = Object.entries(resolver.select)
        .map(([key, value]) => `"${key}": ${value}`)
        .join(', ')
      const query = `*[_id==$id][0]{${projection}}`
      const params = {id}
      const doc$ = documentStore.listenQuery(query, params, {
        perspective: 'previewDrafts',
      }) as Observable<SanityDocument | null>
      return doc$.pipe(map(resolver.resolve))
    }

    // Resolver is explicitly provided state
    return of(resolver)
  }, [documentStore, id, resolver, type])

  useEffect(() => {
    const sub = result?.subscribe((state) => {
      setLocationsState(state || INITIAL_STATE)
      setLocationsStatus(state ? 'resolved' : 'empty')
    })

    return () => sub?.unsubscribe()
  }, [result])

  return {
    state: locationsState,
    status: locationsStatus,
  }
}
