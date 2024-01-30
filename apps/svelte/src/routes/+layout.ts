import { setPreviewing } from '@sanity/svelte-loader'
import type { LayoutLoad } from './$types'

export const load = (({ data: { preview } }) => {
  setPreviewing(preview)
}) satisfies LayoutLoad
