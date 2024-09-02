import type {SanityNode} from '@repo/visual-editing-helpers'
import type {ComponentType, ReactElement} from 'react'

export interface ContextMenuProps {
  node: SanityNode
  onDismiss: () => void
  position: {
    x: number
    y: number
  }
}

export interface ContextMenuActionNode {
  type: 'action'
  icon?: ReactElement | ComponentType
  label: string
  hotkeys?: string[]
  action?: () => void
}
export interface ContextMenuDividerNode {
  type: 'divider'
}

export interface ContextMenuGroupNode {
  type: 'group'
  icon?: ReactElement | ComponentType
  label: string
  items: ContextMenuNode[]
}

export type ContextMenuNode = ContextMenuDividerNode | ContextMenuActionNode | ContextMenuGroupNode
