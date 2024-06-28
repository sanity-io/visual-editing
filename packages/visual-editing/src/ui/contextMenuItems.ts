import type {
  DocumentSchema,
  SchemaArrayItem,
  SchemaNode,
  SchemaObjectField,
  SchemaUnionOption,
} from '@repo/visual-editing-helpers'
import {InsertAboveIcon, InsertBelowIcon} from '@sanity/icons'
import type {ComponentType, ReactElement} from 'react'

import {getNodeIcon} from './getNodeIcon'

export interface ContextMenuActionNode {
  type: 'action'
  icon?: ReactElement | ComponentType
  label: string
  hotkeys?: string[]
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

const ACTION_COPY: ContextMenuActionNode = {type: 'action', label: 'Copy'}
const ACTION_PASTE: ContextMenuActionNode = {type: 'action', label: 'Paste'}
const ACTION_CLEAR: ContextMenuActionNode = {type: 'action', label: 'Clear'}

export function getContextMenuItems(
  schemaType: SchemaArrayItem | SchemaObjectField | SchemaUnionOption | undefined,
): ContextMenuNode[] {
  if (!schemaType) return []

  const {value: node} = schemaType

  if (node.type === 'string' || node.type === 'number' || node.type === 'boolean') {
    return [ACTION_COPY, ACTION_PASTE, ACTION_CLEAR]
  }
  if (node.type === 'object') {
    return [ACTION_COPY, ACTION_PASTE]
  }

  return []
}

export function getContextMenuParentItems(
  parent:
    | DocumentSchema
    | SchemaNode
    | SchemaArrayItem<SchemaNode>
    | SchemaUnionOption<SchemaNode>
    | undefined,
): ContextMenuNode[] {
  if (!parent) return []

  if (parent?.type === 'union') {
    return [
      {
        type: 'group',
        label: 'Add item before',
        icon: InsertAboveIcon,
        items: (
          parent.of.filter((item) => item.type === 'unionOption') as SchemaUnionOption<SchemaNode>[]
        ).map((t) => {
          return {
            type: 'action',
            icon: getNodeIcon(t),
            label: t.name === 'block' ? 'Paragraph' : t.title || t.name,
          }
        }),
      },
      {
        type: 'group',
        label: 'Add item after',
        icon: InsertBelowIcon,
        items: (
          parent.of.filter((item) => item.type === 'unionOption') as SchemaUnionOption<SchemaNode>[]
        ).map((t) => {
          return {
            type: 'action',
            icon: getNodeIcon(t),
            label: t.name === 'block' ? 'Paragraph' : t.title || t.name,
          }
        }),
      },
    ]
  }

  return []
}
