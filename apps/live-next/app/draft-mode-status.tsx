'use client'

import {useDraftModeEnvironment, useDraftModePerspective} from '@sanity/next-loader/hooks'

export function DraftModeStatus() {
  const perspective = useDraftModePerspective()
  const environment = useDraftModeEnvironment()
  return (
    <div className="fixed bottom-3 right-3 block rounded bg-theme-inverse px-2 py-1 text-xs text-theme-inverse">
      <p>perspective: {perspective}</p>
      <p>environment: {environment}</p>
    </div>
  )
}
