import {urlSearchParamPreviewPathname, urlSearchParamPreviewSecret} from './constants'
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
  let redirectTo = undefined
  const unsafeRedirectTo = url.searchParams.get(urlSearchParamPreviewPathname)
  if (unsafeRedirectTo) {
    const {pathname, search, hash} = new URL(unsafeRedirectTo, 'http://localhost')
    redirectTo = `${pathname}${search}${hash}`
  }
  return {secret, redirectTo}
}
