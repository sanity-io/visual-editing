import type {ClientPerspective} from '@sanity/client'
import {useVisualEditingEnvironment} from '@sanity/visual-editing/react'

function formatValue(value: unknown): string {
  return JSON.stringify(value) ?? 'undefined'
}

/**
 * Fixed badge showing the perspective and variant the core loaders are
 * currently fetching with, plus the detected visual editing environment.
 */
export function PreviewStatus(props: {
  perspective: ClientPerspective | undefined
  variant: string | undefined
}) {
  const {perspective, variant} = props
  const environment = useVisualEditingEnvironment()

  return (
    <div className="fixed right-3 bottom-3 z-50 block rounded border border-black/10 bg-white/95 px-2 py-1 text-xs text-black shadow-sm backdrop-blur dark:border-white/10 dark:bg-black/95 dark:text-white">
      <p>
        perspective: <code>{formatValue(perspective)}</code>
      </p>
      <p>
        variant: <code>{formatValue(variant)}</code>
      </p>
      <p>
        environment: <code>{formatValue(environment)}</code>
      </p>
    </div>
  )
}
