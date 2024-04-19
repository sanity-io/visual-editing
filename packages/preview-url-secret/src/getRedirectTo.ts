import {urlSearchParamPreviewPathname} from './constants'

/**
 * @internal
 */
export function getRedirectTo(url: URL): URL {
  if (url.searchParams.has(urlSearchParamPreviewPathname)) {
    return new URL(url.searchParams.get(urlSearchParamPreviewPathname)!, url.origin)
  }

  return url
}
