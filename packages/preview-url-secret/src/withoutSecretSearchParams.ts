import {
  urlSearchParamPreviewPathname,
  urlSearchParamPreviewPerspective,
  urlSearchParamPreviewSecret,
  urlSearchParamVercelProtectionBypass,
  urlSearchParamVercelSetBypassCookie,
} from './constants'

/** @alpha */
export function withoutSecretSearchParams(url: URL): URL {
  const newUrl = new URL(url)
  const {searchParams} = newUrl
  searchParams.delete(urlSearchParamPreviewPathname)
  searchParams.delete(urlSearchParamPreviewSecret)
  searchParams.delete(urlSearchParamPreviewPerspective)
  searchParams.delete(urlSearchParamVercelProtectionBypass)
  searchParams.delete(urlSearchParamVercelSetBypassCookie)
  return newUrl
}

/** @alpha */
export function hasSecretSearchParams(url: URL): boolean {
  return url.searchParams.has(urlSearchParamPreviewSecret)
}

/** @alpha */
export function setSecretSearchParams(
  url: URL,
  secret: string | null,
  redirectTo: string,
  perspective: string,
): URL {
  const newUrl = new URL(url)
  const {searchParams} = newUrl
  // Preview secrets are added when preview mode is setup with an `enable` endpoint
  if (secret) {
    searchParams.set(urlSearchParamPreviewSecret, secret)
    searchParams.set(urlSearchParamPreviewPathname, redirectTo)
  }
  // Always set the perspective that's being used
  searchParams.set(urlSearchParamPreviewPerspective, perspective)

  return newUrl
}
