import { useEffect, useState } from 'react'
import { isObservable, of } from 'rxjs'
import { useDocumentStore } from 'sanity'

import { DocumentLocationResolver, DocumentLocationsState } from './types'

const INITIAL_STATE: DocumentLocationsState = { locations: [] }

export function useDocumentLocations(props: {
  id: string
  locate?: DocumentLocationResolver
  type: string
}): DocumentLocationsState {
  const { id, locate, type } = props
  const documentStore = useDocumentStore()
  const [state, setLocations] = useState<DocumentLocationsState>(INITIAL_STATE)

  useEffect(() => {
    if (!locate) return undefined

    const params = { id, type }
    const context = { documentStore }

    const result = locate(params, context)
    const locations$ = isObservable(result) ? result : of(result)

    const sub = locations$.subscribe((d) => setLocations(d || INITIAL_STATE))

    return () => sub.unsubscribe()
  }, [documentStore, id, locate, type])

  return state
}
