import { setPreviewing } from '@sanity/svelte-loader'
import type { LayoutLoad } from './$types'

export const load: LayoutLoad = ({ data: { preview } }) => {
  setPreviewing(preview)
}
