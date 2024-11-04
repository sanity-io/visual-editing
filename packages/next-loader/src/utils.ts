/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import type {ClientPerspective} from '@sanity/client'

/** @internal */
export function sanitizePerspective(
  perspective: string | undefined,
  fallback: 'previewDrafts' | 'published',
): ClientPerspective | `bundle.${string}` {
  if (perspective?.startsWith('bundle.')) return perspective as `bundle.${string}`
  switch (perspective) {
    case 'previewDrafts':
    case 'published':
      return perspective satisfies ClientPerspective
    default:
      return fallback satisfies ClientPerspective
  }
}

/**
 * This is a small hack, perspective=published is returning incorrect results, using it through bundlePerspective works fine.
 * @internal
 */
export function getBundlePerspective(
  perspective: ClientPerspective | `bundle.${string}`,
  bundlePerspective: string[],
): string[] {
  if (perspective === 'published') return ['published']
  if (perspective === 'previewDrafts') return ['drafts']
  if (perspective.startsWith('bundle.')) return bundlePerspective
  throw new Error(`Invalid perspective: ${perspective}`)
}
