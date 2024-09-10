'use server'

import type {SyncTag} from 'next-sanity'
import {revalidatePath, revalidateTag} from 'next/cache'
import {draftMode} from 'next/headers'

export async function disableDraftMode() {
  'use server'
  await Promise.allSettled([
    draftMode().disable(),
    // Simulate a delay to show the loading state
    new Promise((resolve) => setTimeout(resolve, 1000)),
  ])
}

export async function revalidateSyncTags(tags: SyncTag[]) {
  for (const _tag of tags) {
    const tag = `sanity:${_tag}`
    revalidateTag(tag)
    console.log(`Revalidated tag: ${tag}`)
  }
}

export async function purgeEverything() {
  revalidatePath('/', 'layout')
}

export async function purgeSanity() {
  revalidateTag('sanity')
}
