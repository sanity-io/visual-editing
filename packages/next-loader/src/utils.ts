import {validateApiPerspective, type ClientPerspective} from '@sanity/client'

/** @internal */
export function sanitizePerspective(
  _perspective: unknown,
  fallback: 'previewDrafts' | 'published',
): Exclude<ClientPerspective, 'raw'> {
  const perspective =
    typeof _perspective === 'string' && _perspective.includes(',')
      ? _perspective.split(',')
      : _perspective
  try {
    validateApiPerspective(perspective)
    return perspective === 'raw' ? fallback : perspective
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`Invalid perspective:`, _perspective, perspective, err)
    return fallback
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
