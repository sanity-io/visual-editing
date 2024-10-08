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
import type {SanityDocument} from '@sanity/types'
import type {ContextMenuNode} from '../../types'
import {getNodeIcon} from '../../util/getNodeIcon'
import {
  getArrayInsertMutations,
  getArrayMoveMutations,
  getArrayRemoveMutations,
} from '../../util/mutations'
import type {DocumentMutate} from '../optimistic-state/useDocuments'
import type {OverlayElementField, OverlayElementParent} from '../schema/schema'

export function getContextMenuItems(context: {
  node: SanityNode
  doc: SanityDocument | undefined
  mutate: DocumentMutate
  parent: OverlayElementParent
  field: OverlayElementField
}): ContextMenuNode[] {
  const {node, field, parent, doc, mutate} = context
  if (field?.type === 'arrayItem') {
    return getContextMenuArrayItems({node, field, doc, mutate})
  }
  if (parent?.type === 'union') {
    return getContextMenuUnionItems({node, parent, doc, mutate})
  }

  return []
}

function getRemoveItems(context: {
  node: SanityNode
  doc: SanityDocument | undefined
  mutate: DocumentMutate
}) {
  const {node, doc, mutate} = context
  if (!doc) return []
  return [
    {
      type: 'action' as const,
      label: 'Remove',
      icon: RemoveIcon,
      action: () => mutate(node.id, getArrayRemoveMutations(node, doc)),
    },
  ]
}

function getMoveItems(
  context: {
    node: SanityNode
    doc: SanityDocument | undefined
    mutate: DocumentMutate
  },
  withDivider = true,
) {
  const {node, doc, mutate} = context
  if (!doc) return []

  const items: ContextMenuNode[] = []
  const groupItems: ContextMenuNode[] = []
  const moveUpMutations = getArrayMoveMutations(node, doc, 'previous')
  const moveDownMutations = getArrayMoveMutations(node, doc, 'next')
  const moveFirstMutations = getArrayMoveMutations(node, doc, 'first')
  const moveLastMutations = getArrayMoveMutations(node, doc, 'last')

  if (moveFirstMutations) {
    groupItems.push({
      type: 'action',
      label: 'To top',
      icon: PublishIcon,
      action: () => mutate(node.id, moveFirstMutations),
    })
  }
  if (moveUpMutations) {
    groupItems.push({
      type: 'action',
      label: 'Up',
      icon: ArrowUpIcon,
      action: () => mutate(node.id, moveUpMutations),
    })
  }

  if (moveDownMutations) {
    groupItems.push({
      type: 'action',
      label: 'Down',
      icon: ArrowDownIcon,
      action: () => mutate(node.id, moveDownMutations),
    })
  }
  if (moveLastMutations) {
    groupItems.push({
      type: 'action',
      label: 'To bottom',
      icon: UnpublishIcon,
      action: () => mutate(node.id, moveLastMutations),
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
  node: SanityNode
  field: SchemaArrayItem
  doc: SanityDocument | undefined
  mutate: DocumentMutate
}): ContextMenuNode[] {
  const {node, field, mutate} = context
  const items: ContextMenuNode[] = []
  items.push(...getRemoveItems(context))
  items.push(...getMoveItems(context))

  items.push({
    type: 'action',
    label: 'Insert before',
    icon: InsertAboveIcon,
    action: () => {
      const mutations = getArrayInsertMutations(node, field.name, 'before')
      mutate(node.id, mutations)
    },
  })
  items.push({
    type: 'action',
    label: 'Insert after',
    icon: InsertBelowIcon,
    action: () => {
      const mutations = getArrayInsertMutations(node, field.name, 'after')
      mutate(node.id, mutations)
    },
  })

  return items
}

function getContextMenuUnionItems(context: {
  node: SanityNode
  parent: SchemaUnionNode<SchemaNode>
  doc: SanityDocument | undefined
  mutate: DocumentMutate
}): ContextMenuNode[] {
  const {node, parent, mutate} = context
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
        type: 'action',
        icon: getNodeIcon(t),
        label: t.name === 'block' ? 'Paragraph' : t.title || t.name,
        action: () => {
          const mutations = getArrayInsertMutations(node, t.name, 'before')
          mutate(node.id, mutations)
        },
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
        type: 'action',
        label: t.name === 'block' ? 'Paragraph' : t.title || t.name,
        icon: getNodeIcon(t),
        action: () => {
          const mutations = getArrayInsertMutations(node, t.name, 'after')
          mutate(node.id, mutations)
        },
      }
    }),
  })

  return items
}
