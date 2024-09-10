import type {VisualEditingControllerMsg, VisualEditingNodeMsg} from '@repo/visual-editing-helpers'
import type {Node} from '@sanity/comlink'
import type {ContentLakeStore} from '@sanity/mutate/_unstable_store'
import {createContext} from 'react'

export interface OptimisticStateContextValue {
  comlink: Node<VisualEditingControllerMsg, VisualEditingNodeMsg>
  datastore: ContentLakeStore
}

export const OptimisticStateContext = createContext<OptimisticStateContextValue | null>(null)
