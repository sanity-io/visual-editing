import {VisualEditing} from '@sanity/visual-editing/react-router'

import {stegaClient} from '@/sanity/client'
import {useLiveMode} from '@/sanity/loader'

/**
 * Connects the core loaders to Presentation over comlink (live mode) and
 * renders clickable edit overlays. Both are inert when the app is not
 * embedded in Presentation.
 */
export function LiveVisualEditing() {
  useLiveMode({client: stegaClient})

  return <VisualEditing />
}
