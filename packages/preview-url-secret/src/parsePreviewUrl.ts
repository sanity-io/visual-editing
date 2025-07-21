/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  urlSearchParamPreviewPathname,
  urlSearchParamPreviewPerspective,
  urlSearchParamPreviewSecret,
  urlSearchParamVercelProtectionBypass,
  urlSearchParamVercelSetBypassCookie,
} from './constants'
import type {ParsedPreviewUrl, VercelSetBypassCookieValue} from './types'

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
  let redirectTo: string | undefined
  const unsafeRedirectTo = url.searchParams.get(urlSearchParamPreviewPathname)
  if (unsafeRedirectTo) {
    const redirectUrl = new URL(unsafeRedirectTo, 'http://localhost')

    // If there's a preview perspective in the URL we forward it to the redirect to ensure it's set
    if (
      studioPreviewPerspective &&
      !redirectUrl.searchParams.has(urlSearchParamPreviewPerspective)
    ) {
      redirectUrl.searchParams.set(urlSearchParamPreviewPerspective, studioPreviewPerspective)
    }

    // If there's a vercel bypass secret in the redirect URL, we forward it to the redirect to ensure it's set
    if (url.searchParams.has(urlSearchParamVercelProtectionBypass)) {
      redirectUrl.searchParams.set(
        urlSearchParamVercelProtectionBypass,
        url.searchParams.get(urlSearchParamVercelProtectionBypass)!,
      )
      // samesitenone is required since the request is from an iframe
      redirectUrl.searchParams.set(
        urlSearchParamVercelSetBypassCookie,
        'samesitenone' satisfies VercelSetBypassCookieValue,
      )
    }

    const {pathname, search, hash} = redirectUrl
    redirectTo = `${pathname}${search}${hash}`
  }
  return {secret, redirectTo, studioPreviewPerspective}
}
