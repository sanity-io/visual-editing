'use server'

import type {ClientPerspective, SyncTag} from '@sanity/client'
import {perspectiveCookieName} from '@sanity/preview-url-secret/constants'
import {revalidateTag} from 'next/cache.js'
import {cookies, draftMode} from 'next/headers.js'
import {sanitizePerspective} from '../utils'

export async function disableDraftMode(): Promise<void> {
  'use server'
  await Promise.allSettled([
    (await draftMode()).disable(),
    // Simulate a delay to show the loading state
    new Promise((resolve) => setTimeout(resolve, 1000)),
  ])
}

export async function revalidateSyncTags(tags: SyncTag[]): Promise<void> {
  for (const _tag of tags) {
    const tag = `sanity:${_tag}`
    await revalidateTag(tag)
    // eslint-disable-next-line no-console
    console.log(`Revalidated tag: ${tag}`)
  }
}

export async function setPerspectiveCookie(perspective: string): Promise<void> {
  if (!(await draftMode()).isEnabled) {
    // throw new Error('Draft mode is not enabled, setting perspective cookie is not allowed')
    return
  }
  const sanitizedPerspective = sanitizePerspective(perspective, 'previewDrafts')
  if (perspective !== sanitizedPerspective) {
    throw new Error(`Invalid perspective: ${perspective}`)
  }

  ;(await cookies()).set(perspectiveCookieName, perspective satisfies ClientPerspective, {
    httpOnly: true,
    path: '/',
    secure: true,
    sameSite: 'none',
  })
}

// export async function handleDraftModeActionMissing(): Promise<void | string> {
//   return 'The <SanityLive /> component is missing the handleDraftModeAction prop'
// }
