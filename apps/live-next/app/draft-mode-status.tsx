'use client'

import {useDraftModeEnvironment, useDraftModePerspective} from '@sanity/next-loader/hooks'

export function DraftModeStatus() {
  const perspective = useDraftModePerspective()
  const environment = useDraftModeEnvironment()
  return (
    <div className="bg-theme-inverse text-theme-inverse fixed bottom-3 right-3 block rounded px-2 py-1 text-xs">
      <p>perspective: {perspective}</p>
      <p>environment: {environment}</p>
    </div>
  )
}
