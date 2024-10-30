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
  CopyIcon,
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
  getArrayDuplicatePatches,
  getArrayInsertPatches,
  getArrayMovePatches,
  getArrayRemovePatches,
} from '../../util/mutations'
import type {OptimisticDocument} from '../optimistic-state/useDocuments'

export function getArrayRemoveAction(node: SanityNode, doc: OptimisticDocument): () => void {
  if (!node.type) throw new Error('Node type is missing')
  return () => doc.patch(({snapshot}) => getArrayRemovePatches(node, snapshot))
}

function getArrayInsertAction(
  node: SanityNode,
  doc: OptimisticDocument,
  insertType: string,
  position: 'before' | 'after',
): () => void {
  if (!node.type) throw new Error('Node type is missing')
  return () => doc.patch(() => getArrayInsertPatches(node, insertType, position))
}

function getDuplicateAction(node: SanityNode, doc: OptimisticDocument): () => void {
  if (!node.type) throw new Error('Node type is missing')
  return () => doc.patch(({snapshot}) => getArrayDuplicatePatches(node, snapshot))
}

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

function getDuplicateItem(context: {doc: OptimisticDocument; node: SanityNode}) {
  const {node, doc} = context
  if (!doc) return []
  return [
    {
      type: 'action' as const,
      label: 'Duplicate',
      icon: CopyIcon,
      action: getDuplicateAction(node, doc),
    },
  ]
}

function getRemoveItems(context: {doc: OptimisticDocument; node: SanityNode}) {
  const {node, doc} = context
  if (!doc) return []
  return [
    {
      type: 'action' as const,
      label: 'Remove',
      icon: RemoveIcon,
      action: getArrayRemoveAction(node, doc),
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
  items.push(...getDuplicateItem(context))
  items.push(...getRemoveItems(context))
  items.push(...getMoveItems(context))

  items.push({
    type: 'action',
    label: 'Insert before',
    icon: InsertAboveIcon,
    action: getArrayInsertAction(node, doc, field.name, 'before'),
  })
  items.push({
    type: 'action',
    label: 'Insert after',
    icon: InsertBelowIcon,
    action: getArrayInsertAction(node, doc, field.name, 'after'),
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
  items.push(...getDuplicateItem(context))
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
        action: getArrayInsertAction(node, doc, t.name, 'before'),
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
        action: getArrayInsertAction(node, doc, t.name, 'after'),
      }
    }),
  })

  return items
}
