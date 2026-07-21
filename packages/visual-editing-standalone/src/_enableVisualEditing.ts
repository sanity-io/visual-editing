import {enableVisualEditing as enableVisualEditingSource} from '@sanity/visual-editing/enable-visual-editing'

type ClientPerspective = 'previewDrafts' | 'published' | 'drafts' | 'raw' | string[]

type SanityNode = {
  baseUrl: string
  id: string
  path: string
  perspective?: string
  dataset?: string
  projectId?: string
  tool?: string
  type?: string
  workspace?: string
}

type SanityStegaNode = {
  origin: string
  href: string
  data?: unknown
}

/**
 * Preview frame history update.
 * @public
 */
export interface HistoryUpdate {
  type: 'push' | 'pop' | 'replace'
  title?: string
  url: string
}

/**
 * Preview frame refresh event emitted by Presentation Tool.
 * @public
 */
export type HistoryRefresh =
  | {
      source: 'manual'
      livePreviewEnabled: boolean
    }
  | {
      source: 'mutation'
      livePreviewEnabled: boolean
      document: {
        _id: string
        _type: string
        _rev: string
        slug?: {
          current?: string | null
        }
      }
    }

/**
 * Sends a navigation update to Presentation Tool.
 * @public
 */
export type HistoryAdapterNavigate = (update: HistoryUpdate) => void

/**
 * Connects an application router to Presentation Tool.
 * @public
 */
export interface HistoryAdapter {
  subscribe: (navigate: HistoryAdapterNavigate) => () => void
  update: (update: HistoryUpdate) => void
}

/**
 * A report of stega metadata found where it can cause bugs or unnecessary bloat.
 * @public
 */
export interface SuspiciousStegaReport {
  kind: 'attribute' | 'head' | 'script' | 'style' | 'form-value' | 'url'
  element?: Element
  attribute?: string
  value: string
  cleaned: string
  sanity?: SanityNode | SanityStegaNode
}

/**
 * Framework-neutral options for enabling Visual Editing.
 *
 * React-based custom overlay components and plugins remain available from
 * `@sanity/visual-editing`.
 * @public
 */
export interface VisualEditingOptions {
  history?: HistoryAdapter
  keepStegaOnCopy?: boolean
  onPerspectiveChange?: (perspective: ClientPerspective) => void
  onSuspiciousStega?: (reports: SuspiciousStegaReport[]) => void
  refresh?: (payload: HistoryRefresh) => false | Promise<void>
  zIndex?: string | number
}

/**
 * Disables Visual Editing and cleans up its overlays and listeners.
 * @public
 */
export type DisableVisualEditing = () => void

/**
 * Enables Visual Editing overlays on a page with Content Source Map encoding.
 * @public
 */
export function enableVisualEditing(options: VisualEditingOptions = {}): DisableVisualEditing {
  return enableVisualEditingSource(options)
}
