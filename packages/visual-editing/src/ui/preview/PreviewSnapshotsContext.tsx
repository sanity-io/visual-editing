import type {PreviewSnapshot} from '@sanity/presentation-comlink'
import {createContext} from 'react'

export type PreviewSnapshotsContextValue = PreviewSnapshot[]

export const PreviewSnapshotsContext = createContext<PreviewSnapshotsContextValue | null>(null)
