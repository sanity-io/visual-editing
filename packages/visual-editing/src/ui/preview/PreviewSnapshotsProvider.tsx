import type {VisualEditingControllerMsg, VisualEditingNodeMsg} from '@repo/visual-editing-helpers'
import type {Node} from '@sanity/comlink'
import {type FunctionComponent, type PropsWithChildren, useEffect, useMemo, useState} from 'react'

import {PreviewSnapshotsContext, type PreviewSnapshotsContextValue} from './PreviewSnapshotsContext'

export const PreviewSnapshotsProvider: FunctionComponent<
  PropsWithChildren<{
    comlink: Node<VisualEditingControllerMsg, VisualEditingNodeMsg>
  }>
> = function (props) {
  const {comlink, children} = props

  const [previewSnapshots, setPreviewSnapshots] = useState<PreviewSnapshotsContextValue>([])

  useEffect(() => {
    return comlink.on('presentation/previewSnapshots', (data) => {
      setPreviewSnapshots(data.snapshots)
    })
  }, [comlink])

  const context = useMemo<PreviewSnapshotsContextValue>(() => previewSnapshots, [previewSnapshots])
  return (
    <PreviewSnapshotsContext.Provider value={context}>{children}</PreviewSnapshotsContext.Provider>
  )
}
