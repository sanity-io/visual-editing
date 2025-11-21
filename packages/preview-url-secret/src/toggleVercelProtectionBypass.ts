import type {SanityClient, SyncTag} from '@sanity/client'
import {fetchVercelProtectionBypassSecret} from './constants'
import type {SanityClientLike} from './types'

/** @internal */
export function subscribeToVercelProtectionBypass(
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
