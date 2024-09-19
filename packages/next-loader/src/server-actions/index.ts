'use server'

import type {ClientPerspective, SyncTag} from '@sanity/client'
import {revalidateTag} from 'next/cache.js'
import {cookies, draftMode} from 'next/headers.js'
import {perspectiveCookieName} from '../constants'

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

export async function setPerspectiveCookie(perspective: string): Promise<void> {
  if (!draftMode().isEnabled) {
    throw new Error('Draft mode is not enabled, setting perspective cookie is not allowed')
  }
  switch (perspective) {
    case 'previewDrafts':
    case 'published':
      cookies().set(perspectiveCookieName, perspective satisfies ClientPerspective, {
        httpOnly: true,
      })
      return
    default:
      throw new Error(`Invalid perspective: ${perspective}`)
  }
}

export async function handleDraftModeActionMissing(): Promise<void | string> {
  return 'The <SanityLive /> component is missing the handleDraftModeAction prop'
}
