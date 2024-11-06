/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Pages Router throws if any module is importing something with a `use server` directive.
 * This shim allows a pages router app to import other things from `next-sanity`, like `import {defineQuery} from 'next-sanity'` without running into errors.
 */

import type {
  DefinedSanityFetchType,
  DefinedSanityLiveProps,
  DefinedSanityLiveStreamType,
  DefineSanityLiveOptions,
} from './defineLive'

/**
 * @public
 */
export function defineLive(config: DefineSanityLiveOptions): {
  sanityFetch: DefinedSanityFetchType
  SanityLive: React.ComponentType<DefinedSanityLiveProps>
  SanityLiveStream: DefinedSanityLiveStreamType
} {
  throw new Error('defineLive can only be used in React Server Components')
}

/**
 * @public
 */
export type {
  DefineSanityLiveOptions,
  DefinedSanityFetchType,
  DefinedSanityLiveProps,
  DefinedSanityLiveStreamType,
}

export * from './isCorsOriginError'
