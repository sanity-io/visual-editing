import type {
  SanityNode,
  SchemaArrayItem,
  SchemaNode,
  SchemaUnionNode,
  SchemaUnionOption,
} from '@repo/visual-editing-helpers'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  InsertAboveIcon,
  InsertBelowIcon,
  PublishIcon,
  RemoveIcon,
  SortIcon,
  UnpublishIcon,
} from '@sanity/icons'
import type {ContextMenuNode, OverlayElementField, OverlayElementParent} from '../../types'
import {getNodeIcon} from '../../util/getNodeIcon'
import {
  getArrayInsertPatches,
  getArrayMovePatches,
  getArrayRemovePatches,
} from '../../util/mutations'
import type {OptimisticDocument} from '../optimistic-state/useDocuments'

export function getContextMenuItems(context: {
  doc: OptimisticDocument
  field: OverlayElementField
  node: SanityNode
  parent: OverlayElementParent
}): ContextMenuNode[] {
  const {node, field, parent, doc} = context
  if (field?.type === 'arrayItem') {
    return getContextMenuArrayItems({node, field, doc})
  }
  if (parent?.type === 'union') {
    return getContextMenuUnionItems({node, parent, doc})
  }

  return []
}

function getRemoveItems(context: {doc: OptimisticDocument; node: SanityNode}) {
  const {node, doc} = context
  if (!doc) return []
  return [
    {
      type: 'action' as const,
      label: 'Remove',
      icon: RemoveIcon,
      action: () => doc.patch(getArrayRemovePatches(node, doc)),
    },
  ]
}

function getMoveItems(
  context: {
    doc: OptimisticDocument
    node: SanityNode
  },
  withDivider = true,
) {
  const {node, doc} = context
  if (!doc) return []

  const items: ContextMenuNode[] = []
  const groupItems: ContextMenuNode[] = []
  const moveUpPatches = getArrayMovePatches(node, doc, 'previous')
  const moveDownPatches = getArrayMovePatches(node, doc, 'next')
  const moveFirstPatches = getArrayMovePatches(node, doc, 'first')
  const moveLastPatches = getArrayMovePatches(node, doc, 'last')

  if (moveFirstPatches.length) {
    groupItems.push({
      type: 'action',
      label: 'To top',
      icon: PublishIcon,
      action: () => doc.patch(moveFirstPatches),
    })
  }
  if (moveUpPatches.length) {
    groupItems.push({
      type: 'action',
      label: 'Up',
      icon: ArrowUpIcon,
      action: () => doc.patch(moveUpPatches),
    })
  }

  if (moveDownPatches.length) {
    groupItems.push({
      type: 'action',
      label: 'Down',
      icon: ArrowDownIcon,
      action: () => doc.patch(moveDownPatches),
    })
  }
  if (moveLastPatches.length) {
    groupItems.push({
      type: 'action',
      label: 'To bottom',
      icon: UnpublishIcon,
      action: () => doc.patch(moveLastPatches),
    })
  }

  if (groupItems.length) {
    items.push({
      type: 'group',
      label: 'Move',
      icon: SortIcon,
      items: groupItems,
    })
    if (withDivider) {
      items.push({type: 'divider'})
    }
  }

  return items
}

function getContextMenuArrayItems(context: {
  doc: OptimisticDocument
  field: SchemaArrayItem
  node: SanityNode
}): ContextMenuNode[] {
  const {node, field, doc} = context
  const items: ContextMenuNode[] = []
  items.push(...getRemoveItems(context))
  items.push(...getMoveItems(context))

  items.push({
    type: 'action',
    label: 'Insert before',
    icon: InsertAboveIcon,
    action: () => doc.patch(getArrayInsertPatches(node, doc, field.name, 'before')),
  })
  items.push({
    type: 'action',
    label: 'Insert after',
    icon: InsertBelowIcon,
    action: () => doc.patch(getArrayInsertPatches(node, doc, field.name, 'after')),
  })

  return items
}

function getContextMenuUnionItems(context: {
  doc: OptimisticDocument
  node: SanityNode
  parent: SchemaUnionNode<SchemaNode>
}): ContextMenuNode[] {
  const {doc, node, parent} = context
  const items: ContextMenuNode[] = []
  items.push(...getRemoveItems(context))
  items.push(...getMoveItems(context))

  items.push({
    type: 'group',
    label: 'Insert before',
    icon: InsertAboveIcon,
    items: (
      parent.of.filter((item) => item.type === 'unionOption') as SchemaUnionOption<SchemaNode>[]
    ).map((t) => {
      return {
        type: 'action' as const,
        icon: getNodeIcon(t),
        label: t.name === 'block' ? 'Paragraph' : t.title || t.name,
        action: () => doc.patch(getArrayInsertPatches(node, doc, t.name, 'before')),
      }
    }),
  })
  items.push({
    type: 'group',
    label: 'Insert after',
    icon: InsertBelowIcon,
    items: (
      parent.of.filter((item) => item.type === 'unionOption') as SchemaUnionOption<SchemaNode>[]
    ).map((t) => {
      return {
        type: 'action' as const,
        label: t.name === 'block' ? 'Paragraph' : t.title || t.name,
        icon: getNodeIcon(t),
        action: () => {
          doc.patch(getArrayInsertPatches(node, doc, t.name, 'after'))
        },
      }
    }),
  })

  return items
}
