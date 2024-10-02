import {setPreviewing} from '@sanity/visual-editing/svelte'
import type {LayoutLoad} from './$types'

export const load: LayoutLoad = ({data}) => {
  const {preview} = data
  setPreviewing(preview)
  return data
}
