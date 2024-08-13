import type {PreviewValue} from '@sanity/types'
import {createContext} from 'react'

export type PreviewSnapshotsContextValue = Array<PreviewValue & {_id: string}>

export const PreviewSnapshotsContext = createContext<PreviewSnapshotsContextValue | null>(null)
