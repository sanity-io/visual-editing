import { Root } from 'react-dom/client'

export type DisableVisualEditing = () => void

/**
 * Enables Visual Editing overlay in a page with sourcemap encoding.
 *
 * This will overlay UI on hovered elements that deep-links to Sanity Studio.
 *
 * @public
 */
export function enableVisualEditing(): DisableVisualEditing {
  let cancelled = false
  let node: HTMLElement | null = null
  let root: Root | null = null

  // Lazy load everything needed to render the app
  Promise.all([
    import('react-dom/client'),
    import('./components/VisualEditingOverlay'),
  ]).then(([reactClient, { VisualEditingOverlay }]) => {
    if (cancelled) return

    node = document.createElement('div')
    node.id = 'sanity-visual-editing'
    document.body.appendChild(node)

    const { createRoot } =
      'default' in reactClient ? reactClient.default : reactClient
    root = createRoot(node)
    root.render(<VisualEditingOverlay />)
  })

  return () => {
    cancelled = true
    if (root) root.unmount()
    if (node) document.body.removeChild(node)
  }
}
