import {
  urlSearchParamPreviewBundlePerspective,
  urlSearchParamPreviewPathname,
  urlSearchParamPreviewPerspective,
  urlSearchParamPreviewSecret,
} from './constants'

/** @alpha */
export function withoutSecretSearchParams(url: URL): URL {
  const newUrl = new URL(url)
  const {searchParams} = newUrl
  searchParams.delete(urlSearchParamPreviewPathname)
  searchParams.delete(urlSearchParamPreviewSecret)
  searchParams.delete(urlSearchParamPreviewPerspective)
  searchParams.delete(urlSearchParamPreviewBundlePerspective)
  return newUrl
}

/** @alpha */
export function hasSecretSearchParams(url: URL): boolean {
  return url.searchParams.has(urlSearchParamPreviewSecret)
}

/** @alpha */
export function setSecretSearchParams(
  url: URL,
  secret: string,
  redirectTo: string,
  perspective: string,
): URL {
  const newUrl = new URL(url)
  const {searchParams} = newUrl
  searchParams.set(urlSearchParamPreviewSecret, secret)
  searchParams.set(urlSearchParamPreviewPathname, redirectTo)
  searchParams.set(urlSearchParamPreviewPerspective, perspective)
  return newUrl
}
