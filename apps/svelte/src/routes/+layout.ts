import { setDraftMode } from '@sanity/svelte-loader'
import type { LayoutLoad } from './$types'

export const load = (({ data: { draftMode } }) => {
  setDraftMode(draftMode)
}) satisfies LayoutLoad
