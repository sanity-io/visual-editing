/**
 * The purpose of this file is to contain the logic for rendering the <VisualEditing />
 * component in a way that is easy to lazy load for the `enableVisualEditing` function.
 */

import {StrictMode} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import type {VisualEditingOptions} from '../types'
import {VisualEditing} from './VisualEditing'

let node: HTMLElement | null = null
let root: Root | null = null
let cleanup: ReturnType<typeof setTimeout> | null = null

export function renderVisualEditing(
  signal: AbortSignal,
  {components, history, refresh, zIndex}: VisualEditingOptions,
): void {
  // Cancel pending cleanups, this is useful to avoid overlays blinking as the parent app transition between URLs, or hot module reload is happening
  if (cleanup) clearTimeout(cleanup)
  // Setup a cleanup function listener right away, as the signal might abort in-between the next steps
  signal.addEventListener('abort', () => {
    // Handle React StrictMode, delay cleanup for a second in case it's a rerender
    cleanup = setTimeout(() => {
      if (root) {
        root.unmount()
        root = null
      }
      if (node) {
        node.parentNode!.removeChild(node)

        node = null
      }
    }, 1000)
  })

  if (!node) {
    node = document.createElement('sanity-visual-editing')
    // render sanity-visual-editing after closing </body> tag
    document.body.parentNode!.insertBefore(node, document.body.nextSibling)
  }

  if (!root) {
    root = createRoot(node)
  }

  root.render(
    <StrictMode>
      <VisualEditing
        components={components}
        history={history}
        refresh={refresh}
        zIndex={zIndex}
        // Disabling the portal, as this function is already making sure the overlays render in the right spot
        portal={false}
      />
    </StrictMode>,
  )
}
