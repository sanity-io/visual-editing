import {
  createOverlayController as _createOverlayController,
  type DisableVisualEditing as _DisableVisualEditing,
  type ElementState as _ElementState,
  enableVisualEditing as _enableVisualEditing,
  type HistoryAdapter as _HistoryAdapter,
  type HistoryAdapterNavigate as _HistoryAdapterNavigate,
  type HistoryUpdate as _HistoryUpdate,
  type OverlayEventHandler as _OverlayEventHandler,
} from '@sanity/visual-editing'

/**
 * @deprecated use `import {createOverlayController} from '@sanity/visual-editing'` instead
 */
export const createOverlayController: typeof _createOverlayController = (
  options,
) => {
  warn()
  return _createOverlayController(options)
}

/**
 * @deprecated use `import {enableVisualEditing} from '@sanity/visual-editing'` instead
 */
export const enableVisualEditing: typeof _enableVisualEditing = (options) => {
  warn()
  return _enableVisualEditing(options)
}

/**
 * @deprecated use `import type {DisableVisualEditing} from '@sanity/visual-editing'` instead
 */
export type DisableVisualEditing = _DisableVisualEditing

/**
 * @deprecated use `import {enableVisualEditing} from '@sanity/visual-editing'` instead
 */
export const enableOverlays: typeof _enableVisualEditing = (options) => {
  warn()
  return _enableVisualEditing(options)
}

/**
 * @deprecated use `import type {DisableVisualEditing} from '@sanity/visual-editing'` instead
 */
export type DisableOverlays = _DisableVisualEditing

/**
 * @deprecated use `import type {HistoryAdapter} from '@sanity/visual-editing'` instead
 */
export type HistoryAdapter = _HistoryAdapter
/**
 * @deprecated use `import type {HistoryAdapterNavigate} from '@sanity/visual-editing'` instead
 */
export type HistoryAdapterNavigate = _HistoryAdapterNavigate
/**
 * @deprecated use `import type {HistoryUpdate} from '@sanity/visual-editing'` instead
 */
export type HistoryUpdate = _HistoryUpdate
/**
 * @deprecated use `import type {OverlayEventHandler} from '@sanity/visual-editing'` instead
 */
export type OverlayEventHandler = _OverlayEventHandler
/**
 * @deprecated use `import type {ElementState} from '@sanity/visual-editing'` instead
 */
export type ElementState = _ElementState

function warn() {
  // eslint-disable-next-line no-console
  console.warn(
    '@sanity/overlays is deprecated. Use @sanity/visual-editing instead.',
  )
}
