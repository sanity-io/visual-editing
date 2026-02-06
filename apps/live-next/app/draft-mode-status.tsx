'use client'

import {useVisualEditingEnvironment} from '@sanity/visual-editing/react'
import {ViewTransition} from 'react'

export function DraftModeStatus({perspective}: {perspective: string}) {
  const environment = useVisualEditingEnvironment()

  if (environment === null) return null

  return (
    <div className="fixed bottom-3 right-3 block rounded bg-theme-inverse px-2 py-1 text-xs text-theme-inverse">
      <p className="will-change-contents">
        perspective:{' '}
        <ViewTransition>
          <code>{JSON.stringify(perspective)}</code>
        </ViewTransition>
      </p>
      <p className="will-change-contents">
        environment:{' '}
        <ViewTransition>
          <code>{JSON.stringify(environment)}</code>
        </ViewTransition>
      </p>
    </div>
  )
}
