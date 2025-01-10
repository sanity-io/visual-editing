import type {SanityClient, SyncTag} from '@sanity/client'
import {
  vercelProtectionBypassSchemaId as _id,
  vercelProtectionBypassSchemaType as _type,
  apiVersion,
  fetchVercelProtectionBypassSecret,
  tag,
} from './constants'
import type {SanityClientLike} from './types'

/** @internal */
export async function enableVercelProtectionBypass(
  _client: SanityClient,
  secret: string,
): Promise<void> {
  const client = _client.withConfig({apiVersion})
  const patch = client.patch(_id).set({secret})
  await client.transaction().createIfNotExists({_id, _type}).patch(patch).commit({tag})
}

/** @internal */
export async function disableVercelProtectionBypass(_client: SanityClient): Promise<void> {
  const client = _client.withConfig({apiVersion})
  const patch = client.patch(_id).set({secret: null})
  await client.transaction().createIfNotExists({_id, _type}).patch(patch).commit({tag})
}

/** @internal */
export function subcribeToVercelProtectionBypass(
  client: SanityClient,
  onChange: (secret: string | null) => void,
): () => void {
  let controller = new AbortController()
  let usedTags: SyncTag[] = []
  async function fetchSecret(lastLiveEventId: string | null, signal: AbortSignal) {
    const {result, syncTags} = await client.fetch<string | null>(
      fetchVercelProtectionBypassSecret,
      {},
      {
        filterResponse: false,
        lastLiveEventId,
        tag: 'preview-url-secret.fetch-vercel-bypass-protection-secret',
      },
    )
    if (Array.isArray(syncTags)) {
      usedTags = syncTags
    }
    if (!signal.aborted) {
      onChange(result)
    }
  }
  const subscription = client.live.events().subscribe({
    next: (event) => {
      if (event.type === 'message') {
        controller.abort()
        controller = new AbortController()
        if (event.tags.some((tag) => usedTags.includes(tag))) {
          fetchSecret(event.id, controller.signal)
        }
      }
    },
    // eslint-disable-next-line no-console
    error: (reason) => console.error(reason),
  })

  fetchSecret(null, controller.signal)

  return () => {
    subscription.unsubscribe()
    controller.abort()
  }
}

export type {SanityClientLike}
