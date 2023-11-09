import type { SanityDocument } from 'sanity'

import { MissingSlug, UrlState } from '../src/types'

export type { UrlState }

export type UrlResolver = (
  document: SanityDocument,
  urlSecret: string | null | undefined,
  signal?: AbortSignal,
) => UrlState | Promise<UrlState>

export interface DefineUrlResolverOptions {
  base: string | URL
  requiresSlug?: string[]
}
export function defineUrlResolver(
  options: DefineUrlResolverOptions,
): UrlResolver {
  const { base, requiresSlug = [] } = options
  return (document, urlSecret) => {
    const url = new URL(base, location.origin)
    url.searchParams.set('type', document._type)
    url.searchParams.set('id', document._id)
    const slug = (document?.slug as any)?.current
    if (slug) {
      url.searchParams.set('slug', slug)
    } else if (requiresSlug.includes(document._type)) {
      return MissingSlug
    }
    if (urlSecret) {
      url.searchParams.set('secret', urlSecret)
    }
    return url.toString()
  }
}
