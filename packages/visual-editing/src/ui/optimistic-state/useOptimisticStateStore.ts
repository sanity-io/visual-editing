import type {SanityDocument} from '@sanity/types'
// @todo replace zustand!
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
