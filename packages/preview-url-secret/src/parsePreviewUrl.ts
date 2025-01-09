import {
  urlSearchParamPreviewPathname,
  urlSearchParamPreviewPerspective,
  urlSearchParamPreviewSecret,
} from './constants'
import type {ParsedPreviewUrl} from './types'

/**
 * @internal
 */
export function parsePreviewUrl(unsafeUrl: string): ParsedPreviewUrl {
  const url = new URL(unsafeUrl, 'http://localhost')
  const secret = url.searchParams.get(urlSearchParamPreviewSecret)
  if (!secret) {
    throw new Error('Missing secret')
  }
  const studioPreviewPerspective = url.searchParams.get(urlSearchParamPreviewPerspective)
  let redirectTo = undefined
  const unsafeRedirectTo = url.searchParams.get(urlSearchParamPreviewPathname)
  if (unsafeRedirectTo) {
    const redirectUrl = new URL(unsafeRedirectTo, 'http://localhost')

    // If there's a vercel bypass secret in the redirect URL, we forward it to the redirect to ensure it's set
    if (url.searchParams.has('x-vercel-protection-bypass')) {
      redirectUrl.searchParams.set(
        'x-vercel-protection-bypass',
        url.searchParams.get('x-vercel-protection-bypass')!,
      )
      // samesitenone is required since the request is from an iframe
      redirectUrl.searchParams.set('x-vercel-set-bypass-cookie', 'samesitenone')
    }

    const {pathname, search, hash} = redirectUrl
    redirectTo = `${pathname}${search}${hash}`
  }
  return {secret, redirectTo, studioPreviewPerspective}
}
