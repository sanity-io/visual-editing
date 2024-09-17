import {useContext} from 'react'
import {PreviewSnapshotsContext, type PreviewSnapshotsContextValue} from './PreviewSnapshotsContext'

export function usePreviewSnapshots(): PreviewSnapshotsContextValue {
  const context = useContext(PreviewSnapshotsContext)

  if (!context) {
    throw new Error('Preview Snapshots context is missing')
  }

  return context
}
