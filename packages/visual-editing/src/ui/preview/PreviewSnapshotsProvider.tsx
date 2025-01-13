import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FunctionComponent,
  type PropsWithChildren,
} from 'react'
import type {VisualEditingNode} from '../../types'
import {PreviewSnapshotsContext, type PreviewSnapshotsContextValue} from './PreviewSnapshotsContext'

export const PreviewSnapshotsProvider: FunctionComponent<
  PropsWithChildren<{
    comlink?: VisualEditingNode
  }>
> = function (props) {
  const {comlink, children} = props

  const [previewSnapshots, setPreviewSnapshots] = useState<PreviewSnapshotsContextValue>([])

  const fetchPreviewSnapshots = useCallback(
    async (signal: AbortSignal) => {
      if (!comlink) return
      try {
        const response = await comlink.fetch('visual-editing/preview-snapshots', undefined, {
          signal,
          suppressWarnings: true,
        })
        setPreviewSnapshots(response.snapshots)
      } catch (e) {
        // Fail silently as the app may be communicating with a version of
        // Presentation that does not support this feature
      }
    },
    [comlink],
  )
  useEffect(() => {
    if (!comlink) return

    const previewSapshotsFetch = new AbortController()
    const unsub = comlink.onStatus(() => {
      fetchPreviewSnapshots(previewSapshotsFetch.signal)
    }, 'connected')

    return () => {
      previewSapshotsFetch.abort()
      unsub()
    }
  }, [comlink, fetchPreviewSnapshots])

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
