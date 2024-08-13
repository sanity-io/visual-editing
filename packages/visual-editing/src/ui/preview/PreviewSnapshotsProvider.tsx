import type {ChannelsNode} from '@repo/channels'
import type {VisualEditingAPI} from '@repo/visual-editing-helpers'
import {type FunctionComponent, type PropsWithChildren, useEffect, useMemo, useState} from 'react'

import {PreviewSnapshotsContext, type PreviewSnapshotsContextValue} from './PreviewSnapshotsContext'

export const PreviewSnapshotsProvider: FunctionComponent<
  PropsWithChildren<{
    channel: ChannelsNode<VisualEditingAPI>
  }>
> = function (props) {
  const {channel, children} = props

  const [previewSnapshots, setPreviewSnapshots] = useState<PreviewSnapshotsContextValue>([])

  useEffect(() => {
    return channel.on('previewSnapshots', (data) => {
      // eslint-disable-next-line no-console
      console.log('[Overlays] Received preview snapshots', data)
      setPreviewSnapshots(data.snapshots)
    })
  }, [channel])

  const context = useMemo<PreviewSnapshotsContextValue>(() => previewSnapshots, [previewSnapshots])
  return (
    <PreviewSnapshotsContext.Provider value={context}>{children}</PreviewSnapshotsContext.Provider>
  )
}
