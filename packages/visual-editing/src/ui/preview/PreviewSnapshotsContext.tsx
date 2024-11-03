import type {PreviewSnapshot} from '@repo/visual-editing-helpers'
import {createContext} from 'react'

export type PreviewSnapshotsContextValue = PreviewSnapshot[]

export const PreviewSnapshotsContext = createContext<PreviewSnapshotsContextValue | null>(null)
