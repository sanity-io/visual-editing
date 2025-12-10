import type {SanityClient} from '@sanity/client'
import type {ResolveStudioUrl, StudioUrl} from '@sanity/client/csm'
import type {CreateQueryStoreOptions} from '@sanity/core-loader'

import {writable, type Writable} from 'svelte/store'

type StudioUrlLike = StudioUrl | ResolveStudioUrl | undefined

export function defineStudioUrlStore(
  client: CreateQueryStoreOptions['client'],
): Writable<StudioUrlLike> {
  return writable<StudioUrlLike>(
    typeof client === 'object' ? (client as SanityClient)?.config().stega.studioUrl : undefined,
  )
}
