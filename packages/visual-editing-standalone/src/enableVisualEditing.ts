import type {ClientPerspective} from '@sanity/client/csm'
import type {
  DisableVisualEditing,
  HistoryAdapter,
  HistoryRefresh,
  SuspiciousStegaReport,
} from '@sanity/visual-editing/enable-visual-editing'
import {enableVisualEditing as enableVisualEditingSource} from '@sanity/visual-editing/enable-visual-editing'

/**
 * Framework-neutral options for enabling Visual Editing.
 *
 * This is `VisualEditingOptions` from `@sanity/visual-editing` minus the alpha
 * `components` and `plugins` options — they take React components, which this
 * package intentionally does not expose (re-using the upstream type would also
 * pull `@types/react` into the emitted declarations). React-based custom
 * overlay components and plugins remain available from `@sanity/visual-editing`.
 * @public
 */
export interface VisualEditingOptions {
  /**
   * The history adapter is used for Sanity Presentation to navigate URLs in the preview frame.
   */
  history?: HistoryAdapter
  /**
   * While Visual Editing is enabled, stega-encoded metadata (invisible characters) is
   * automatically stripped from clipboard data when content is copied from the page.
   * Set this option to `true` to opt out and keep stega in copied content.
   */
  keepStegaOnCopy?: boolean
  /**
   * This event can be used to make sure server side data fetching uses the same client
   * perspective as the Sanity Studio that is driving the visual editing.
   */
  onPerspectiveChange?: (perspective: ClientPerspective) => void
  /**
   * Reports stega payloads found in places where they always cause bugs or bloat.
   */
  onSuspiciousStega?: (reports: SuspiciousStegaReport[]) => void
  /**
   * The refresh API allows smarter refresh logic than the default `location.reload()` behavior.
   */
  refresh?: (payload: HistoryRefresh) => false | Promise<void>
  /**
   * The CSS z-index on the root node that renders overlays.
   */
  zIndex?: string | number
}

/**
 * Enables Visual Editing overlays on a page with Content Source Map encoding.
 *
 * The overlay renderer (and its inlined React runtime) stays in a separate
 * lazy chunk that only loads when this function is called.
 * @public
 */
export function enableVisualEditing(options: VisualEditingOptions = {}): DisableVisualEditing {
  return enableVisualEditingSource(options)
}
