import type { Root } from 'react-dom/client'

import { OVERLAY_ID } from '../constants'

/**
 * @public
 */
export type DisableVisualEditing = () => void

let node: HTMLElement | null = null
let root: Root | null = null

function cleanup() {
  if (root) {
    root.unmount()
    root = null
  }
  if (node) {
    document.body.removeChild(node)
    node = null
  }
}

/**
 * Enables Visual Editing overlay in a page with sourcemap encoding.
 *
 * This will overlay UI on hovered elements that deep-links to Sanity Studio.
 *
 * @public
 */
export function enableVisualEditing(): DisableVisualEditing {
  if (root || node) return cleanup
  let cancelled = false

  // Lazy load everything needed to render the app
  Promise.all([import('react-dom/client'), import('./VisualEditing')]).then(
    ([reactClient, { VisualEditing }]) => {
      if (cancelled) return

      node = document.createElement('div')
      node.id = OVERLAY_ID
      document.body.appendChild(node)

      const { createRoot } =
        'default' in reactClient ? reactClient.default : reactClient
      root = createRoot(node)
      root.render(<VisualEditing />)
    },
  )

  return () => {
    cancelled = true
    cleanup()
  }
}
