'use server'

import { revalidateTag } from 'next/cache'
import { draftMode } from 'next/headers'

export async function revalidate({ tags }: { tags: string[] }) {
  if (draftMode().isEnabled) {
    for (const tag of tags) {
      await revalidateTag(`previewDrafts:${tag}`)
    }
  }
}
