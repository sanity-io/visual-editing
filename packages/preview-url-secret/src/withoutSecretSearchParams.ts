import {
  urlSearchParamPreviewPathname,
  urlSearchParamPreviewSecret,
} from './constants'

/** @alpha */
export function withoutSecretSearchParams(url: URL): URL {
  const newUrl = new URL(url)
  newUrl.searchParams.delete(urlSearchParamPreviewPathname)
  newUrl.searchParams.delete(urlSearchParamPreviewSecret)
  return newUrl
}
