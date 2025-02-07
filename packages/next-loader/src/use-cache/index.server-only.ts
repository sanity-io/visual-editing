/* eslint-disable @typescript-eslint/no-unused-vars */
import type {ClientPerspective} from '@sanity/client'
import type {SanityCachedFetch, SanityCachedFetchOptions, SanityCachedFetchReturns} from './types'

/**
 * @alpha
 */
export const sanityCachedFetch: SanityCachedFetch = async function sanityCachedFetch<
  const QueryString extends string,
>(options: SanityCachedFetchOptions<QueryString>): SanityCachedFetchReturns<QueryString> {
  throw new Error('sanityCachedFetch can only be used in React Server Components')
}

/**
 * @internal
 */
export async function resolveCookiePerspective(): Promise<Exclude<ClientPerspective, 'raw'>> {
  throw new Error('resolveCookiePerspective can only be used in React Server Components')
}

export type * from './types'
