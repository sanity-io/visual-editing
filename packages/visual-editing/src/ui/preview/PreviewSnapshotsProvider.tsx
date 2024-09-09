import {useEffect, useMemo, useState, type FunctionComponent, type PropsWithChildren} from 'react'
import type {VisualEditingNode} from '../../types'
import {PreviewSnapshotsContext, type PreviewSnapshotsContextValue} from './PreviewSnapshotsContext'

export const PreviewSnapshotsProvider: FunctionComponent<
  PropsWithChildren<{
    comlink?: VisualEditingNode
  }>
> = function (props) {
  const {comlink, children} = props

  const [previewSnapshots, setPreviewSnapshots] = useState<PreviewSnapshotsContextValue>([])

  useEffect(() => {
    return comlink?.on('presentation/preview-snapshots', (data) => {
      setPreviewSnapshots(data.snapshots)
    })
  }, [comlink])

  const context = useMemo<PreviewSnapshotsContextValue>(() => previewSnapshots, [previewSnapshots])
  return (
    <PreviewSnapshotsContext.Provider value={context}>{children}</PreviewSnapshotsContext.Provider>
  )
}
