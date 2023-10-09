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

export type HistoryUpdate = {
  type: 'push' | 'pop' | 'replace'
  url: string
}

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

export type OverlayMsg =
  | {
      type: 'overlay/focus'
      data: SanityNode | SanityNodeLegacy
    }
  | {
      type: 'overlay/navigate'
      data: HistoryUpdate
    }

export type VisualEditingMsg = ComposerMsg | OverlayMsg
