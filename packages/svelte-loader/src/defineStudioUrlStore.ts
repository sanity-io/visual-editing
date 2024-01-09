import type { ResolveStudioUrl, StudioUrl } from '@sanity/client/csm'
import type { SanityStegaClient } from '@sanity/client/stega'
import type { CreateQueryStoreOptions } from '@sanity/core-loader'
import { type Writable, writable } from 'svelte/store'

type StudioUrlLike = StudioUrl | ResolveStudioUrl | undefined

export function defineStudioUrlStore(
  client: CreateQueryStoreOptions['client'],
): Writable<StudioUrlLike> {
  return writable<StudioUrlLike>(
    typeof client === 'object'
      ? (client as SanityStegaClient)?.config().stega?.studioUrl
      : undefined,
  )
}
