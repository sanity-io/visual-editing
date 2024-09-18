'use server'

import type {SyncTag} from '@sanity/client'
import {revalidateTag} from 'next/cache.js'
import {draftMode} from 'next/headers.js'

export async function disableDraftMode(): Promise<void> {
  'use server'
  await Promise.allSettled([
    draftMode().disable(),
    // Simulate a delay to show the loading state
    new Promise((resolve) => setTimeout(resolve, 1000)),
  ])
}

export async function revalidateSyncTags(tags: SyncTag[]): Promise<void> {
  for (const _tag of tags) {
    const tag = `sanity:${_tag}`
    revalidateTag(tag)
    // eslint-disable-next-line no-console
    console.log(`Revalidated tag: ${tag}`)
  }
}
