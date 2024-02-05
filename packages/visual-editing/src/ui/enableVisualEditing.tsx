import type { Root } from 'react-dom/client'

import { OVERLAY_ID } from '../constants'
import { HistoryAdapter } from '../types'

/**
 * Cleanup function used when e.g. unmounting
 * @public
 */
export type DisableVisualEditing = () => void

/**
 * @public
 */
export interface VisualEditingOptions {
  /**
   * The history adapter is used for Sanity Presentation to navigate URLs in the preview frame.
   */
  history?: HistoryAdapter
  /**
   * The CSS z-index on the root node that renders overlays, tweak it accordingly to what layout you have.
   */
  zIndex?: string | number
}

let node: HTMLElement | null = null
let root: Root | null = null
let cleanup: number | null = null

/**
 * Enables Visual Editing overlay in a page with sourcemap encoding.
 *
 * This will overlay UI on hovered elements that deep-links to Sanity Studio.
 * @public
 */
export function enableVisualEditing(
  options: VisualEditingOptions = {},
): DisableVisualEditing {
  if (cleanup) clearTimeout(cleanup)
  const controller = new AbortController()

  // Lazy load everything needed to render the app
  Promise.all([import('react-dom/client'), import('./Overlays')]).then(
    ([reactClient, { Overlays }]) => {
      if (controller.signal.aborted) return

      const { history, zIndex } = options

      if (!node) {
        node = document.createElement('div')
        node.id = OVERLAY_ID
        document.body.appendChild(node)
      }

      if (!root) {
        const { createRoot } =
          'default' in reactClient ? reactClient.default : reactClient
        root = createRoot(node)
      }

      root.render(<Overlays history={history} zIndex={zIndex} />)
    },
  )

  return () => {
    controller.abort()
    // Handle React StrictMode, delay cleanup for a second in case it's a rerender
    cleanup = window.setTimeout(() => {
      if (root) {
        root.unmount()
        root = null
      }
      if (node) {
        document.body.removeChild(node)
        node = null
      }
    }, 1000)
  }
}
