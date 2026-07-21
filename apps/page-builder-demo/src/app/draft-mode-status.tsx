'use client'

import type {ClientPerspective} from '@sanity/client'
import {usePresentationQuery, useVisualEditingEnvironment} from '@sanity/visual-editing/react'
import {defineQuery} from 'next-sanity'
import {ViewTransition} from 'react'

const statusQuery = defineQuery(`*[_id == "siteSettings"][0]{_id}`)

function formatValue(value: unknown): string {
  return JSON.stringify(value)
}

export function DraftModeStatus({
  perspective,
  variant,
}: {
  perspective: Exclude<ClientPerspective, 'raw'>
  variant: string | null
}) {
  const environment = useVisualEditingEnvironment()
  const presentation = usePresentationQuery({query: statusQuery, stega: false})
  if (environment === null) return null

  const displayPerspective = presentation.perspective ?? perspective
  const displayVariant = presentation.variant ?? variant

  return (
    <div className="fixed right-3 bottom-3 z-50 block rounded border border-black/10 bg-white/95 px-2 py-1 text-xs text-black shadow-sm backdrop-blur dark:border-white/10 dark:bg-black/95 dark:text-white">
      <p className="will-change-contents">
        perspective:{' '}
        <ViewTransition>
          <code>{formatValue(displayPerspective)}</code>
        </ViewTransition>
      </p>
      <p className="will-change-contents">
        variant:{' '}
        <ViewTransition>
          <code>{formatValue(displayVariant)}</code>
        </ViewTransition>
      </p>
      <p className="will-change-contents">
        environment:{' '}
        <ViewTransition>
          <code>{formatValue(environment)}</code>
        </ViewTransition>
      </p>
    </div>
  )
}
