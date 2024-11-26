import type {DisableVisualEditing, VisualEditingOptions} from '../types'

/**
 * Enables Visual Editing overlay in a page with sourcemap encoding.
 *
 * This will overlay UI on hovered elements that deep-links to Sanity Studio.
 * @public
 */
export function enableVisualEditing(options: VisualEditingOptions = {}): DisableVisualEditing {
  const controller = new AbortController()
  // Lazy load everything, react, the app, all of it
  import('./renderVisualEditing').then(({renderVisualEditing}) => {
    const {signal} = controller
    /**
     * Due to lazy loading it's possible for the following to happen, and is a consequence of dynamic ESM imports not being cancellable natively:
     * 1. Userland calls `const disableVisualEditing = enableVisualEditing()` and the dynamic ESM import is started.
     * 2. The dynamic import uses the network, and it takes a while to load.
     * 3. The user navigates to a different page in the app that doesn't need Visual Editing, for example a login page.
     * 4. Since the app is no longer in a state where Visual Editing is needed, the user calls `disableVisualEditing()`.
     * 5. The dynamic import eventually resolves and this function is called.
     * When this happens we want to skip calling `renderVisualEditing` since we know it's no longer needed.
     */
    if (signal.aborted) return

    // Hand off to the render function with the signal, which will be subscribed to for detecting when to cancel the rendering if needed and unmount the app.
    renderVisualEditing(signal, options)
  })

  return () => {
    controller.abort()
  }
}
