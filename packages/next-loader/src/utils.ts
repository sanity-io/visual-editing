/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import type {ClientPerspective} from '@sanity/client'

/** @internal */
export function sanitizePerspective(
  perspective: string | undefined,
  fallback: 'previewDrafts' | 'published',
) {
  switch (perspective) {
    case 'previewDrafts':
    case 'published':
      return perspective satisfies ClientPerspective
    default:
      return fallback satisfies ClientPerspective
  }
}
