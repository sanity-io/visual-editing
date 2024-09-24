/**
 * The purpose of this file is to contain the logic for rendering the <VisualEditing />
 * component in a way that is easy to lazy load for the `enableVisualEditing` function.
 */

import {StrictMode} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {OVERLAY_ID} from '../constants'
import type {VisualEditingOptions} from '../types'
import {VisualEditing} from './VisualEditing'

let node: HTMLElement | null = null
let root: Root | null = null
let cleanup: ReturnType<typeof setTimeout> | null = null

export function renderVisualEditing(
  signal: AbortSignal,
  {history, refresh, zIndex}: VisualEditingOptions,
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
    // eslint-disable-next-line no-warning-comments
    // @TODO use 'sanity-visual-editing' instead of 'div'
    node = document.createElement('div')
    // eslint-disable-next-line no-warning-comments
    // @TODO after the element is `sanity-visual-editing` instead of `div`, stop setting this ID
    node.id = OVERLAY_ID

    // render sanity-visual-editing after closing </body> tag
    document.body.parentNode!.insertBefore(node, document.body.nextSibling)
  }

  if (!root) {
    root = createRoot(node)
  }

  root.render(
    <StrictMode>
      <VisualEditing history={history} refresh={refresh} zIndex={zIndex} />
    </StrictMode>,
  )
}
