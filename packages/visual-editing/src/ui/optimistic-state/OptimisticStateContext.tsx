import type {ContentLakeStore} from '@sanity/mutate/_unstable_store'
import {createContext} from 'react'

import type {VisualEditingNode} from '../../types'

export interface OptimisticStateContextValue {
  comlink: VisualEditingNode
  datastore: ContentLakeStore
}

export const OptimisticStateContext = createContext<OptimisticStateContextValue | null>(null)
