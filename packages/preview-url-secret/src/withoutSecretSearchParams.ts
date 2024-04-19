import {urlSearchParamPreviewPathname, urlSearchParamPreviewSecret} from './constants'

/** @alpha */
export function withoutSecretSearchParams(url: URL): URL {
  const newUrl = new URL(url)
  newUrl.searchParams.delete(urlSearchParamPreviewPathname)
  newUrl.searchParams.delete(urlSearchParamPreviewSecret)
  return newUrl
}

/** @alpha */
export function hasSecretSearchParams(url: URL): boolean {
  return url.searchParams.has(urlSearchParamPreviewSecret)
}

/** @alpha */
export function setSecretSearchParams(url: URL, secret: string, redirectTo: string): URL {
  const newUrl = new URL(url)
  newUrl.searchParams.set(urlSearchParamPreviewSecret, secret)
  newUrl.searchParams.set(urlSearchParamPreviewPathname, redirectTo)
  return newUrl
}
