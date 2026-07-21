import {validateApiPerspective, type ClientPerspective} from '@sanity/client'

export interface PreviewParams {
  perspective: Exclude<ClientPerspective, 'raw'>
  variant: string | undefined
}

/**
 * Reads the `sanity-preview-perspective` and `sanity-preview-variant` search params
 * that Presentation appends to preview URLs (via `@sanity/preview-url-secret`).
 *
 * The Next.js apps exchange these for draft-mode cookies on the server. This SPA has
 * no server, so instead they're read once on boot and applied to the client config.
 * Actual authorization is enforced by the Sanity API: draft/variant content only
 * loads if the browser has a Sanity session (`withCredentials`) or a token.
 */
export const previewParams = readPreviewParams()

function readPreviewParams(): PreviewParams | null {
  if (typeof location === 'undefined') return null
  const params = new URLSearchParams(location.search)
  const rawPerspective = params.get('sanity-preview-perspective')
  const variant = params.get('sanity-preview-variant') || undefined

  if (!rawPerspective && !variant) return null

  return {perspective: sanitizePerspective(rawPerspective, 'drafts'), variant}
}

function sanitizePerspective(
  _perspective: string | null,
  fallback: 'drafts',
): Exclude<ClientPerspective, 'raw'> {
  if (!_perspective) return fallback
  const perspective = _perspective.includes(',') ? _perspective.split(',') : _perspective
  try {
    validateApiPerspective(perspective)
    return perspective === 'raw' ? fallback : perspective
  } catch (err) {
    console.warn(`Invalid perspective:`, _perspective, err)
    return fallback
  }
}
