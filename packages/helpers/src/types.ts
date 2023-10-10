/**
 * Data resolved from a Sanity node
 * @public
 */
export type SanityNode = {
  projectId: string
  dataset: string
  id: string
  path: string
  type?: string
  baseUrl: string
  tool?: string
  workspace?: string
}

/**
 * Data resolved from a (legacy) Sanity node
 * @public
 */
export type SanityNodeLegacy = {
  origin: string
  href: string
  data?: string
}

/**
 * Preview frame history update
 * @public
 */
export type HistoryUpdate = {
  type: 'push' | 'pop' | 'replace'
  url: string
}

/**
 * Messages emitted by the composer package
 * @public
 */
export type ComposerMsg =
  | {
      type: 'composer/focus'
      data: { id: string; path: string }
    }
  | {
      type: 'composer/blur'
      data: undefined
    }
  | {
      type: 'composer/navigate'
      data: HistoryUpdate
    }

/**
 * Messages emitted by the overlays package
 * @public
 */
export type OverlayMsg =
  | {
      type: 'overlay/focus'
      data: SanityNode | SanityNodeLegacy
    }
  | {
      type: 'overlay/navigate'
      data: HistoryUpdate
    }

/**
 * Union type of visual editing related messages
 * @public
 */
export type VisualEditingMsg = ComposerMsg | OverlayMsg
