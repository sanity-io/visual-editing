import type {ChannelsNode} from '@repo/channels'
import type {VisualEditingAPI} from '@repo/visual-editing-helpers'
import type {ContentLakeStore} from '@sanity/mutate/_unstable_store'
import {createContext} from 'react'

export interface OptimisticStateContextValue {
  channel: ChannelsNode<VisualEditingAPI>
  datastore: ContentLakeStore
}

export const OptimisticStateContext = createContext<OptimisticStateContextValue | null>(null)
