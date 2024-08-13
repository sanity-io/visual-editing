import type {SanityDocument} from '@sanity/types'
import get from 'lodash.get'
import {useMemo} from 'react'
import {create} from 'zustand'

export interface DocumentStoreState {
  add: (document: SanityDocument | SanityDocument[]) => void
  clear: () => void
  documents: Map<string, SanityDocument>
}

export const useOptimisticStateStore = create<DocumentStoreState>((set) => ({
  documents: new Map(),
  add: (document) =>
    set((state) => {
      const documents = new Map(state.documents)
      const docArray = Array.isArray(document) ? document : [document]
      docArray.forEach((doc) => {
        documents.set(doc._id, doc)
      })
      return {documents}
    }),
  clear: () => set({documents: new Map()}),
}))

export const useOptimisticStateSelector = <U, V>(
  node: {
    id: string
    path?: string | string[]
  },
  initial: U,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform?: (initial: U, optimistic: any) => V,
): V => {
  const {id, path = []} = node
  const documentMap = useOptimisticStateStore((state) => state.documents)

  return useMemo(() => {
    const document = documentMap.get(id)
    const optimistic = get(document, path)
    return transform ? transform(initial, optimistic) : optimistic || initial
  }, [documentMap, id, initial, path, transform])
}
