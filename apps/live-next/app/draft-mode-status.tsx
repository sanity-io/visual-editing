'use client'

import {
  useDraftModeEnvironment,
  useDraftModePerspective,
  useIsLivePreview,
} from '@sanity/next-loader/hooks'

export function DraftModeStatus() {
  const isLivePreview = useIsLivePreview()
  const perspective = useDraftModePerspective()
  const environment = useDraftModeEnvironment()

  if (isLivePreview !== true) return null

  return (
    <div className="fixed bottom-3 right-3 block rounded bg-theme-inverse px-2 py-1 text-xs text-theme-inverse">
      <p>perspective: {perspective}</p>
      <p>environment: {environment}</p>
    </div>
  )
}
