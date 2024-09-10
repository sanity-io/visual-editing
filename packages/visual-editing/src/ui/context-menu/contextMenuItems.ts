import type {
  DocumentSchema,
  SanityNode,
  SchemaArrayItem,
  SchemaNode,
  SchemaObjectField,
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
import {type OptimisticMutate} from '../optimistic-state/useOptimisticMutate'

export function getContextMenuItems(
  node: SanityNode,
  // @todo Will be used for future types
  field: SchemaArrayItem | SchemaObjectField | SchemaUnionOption | undefined,
  parent:
    | DocumentSchema
    | SchemaNode
    | SchemaArrayItem<SchemaNode>
    | SchemaUnionOption<SchemaNode>
    | undefined,
  doc: SanityDocument | undefined,
  mutate: OptimisticMutate,
): ContextMenuNode[] {
  if (parent?.type === 'union') {
    return getContextMenuUnionItems(node, parent, doc, mutate)
  }

  return []
}

export function getContextMenuUnionItems(
  node: SanityNode,
  parent: SchemaUnionNode<SchemaNode>,
  doc: SanityDocument | undefined,
  mutate: OptimisticMutate,
): ContextMenuNode[] {
  const items: ContextMenuNode[] = []
  if (doc) {
    items.push({
      type: 'action',
      label: 'Remove',
      icon: RemoveIcon,
      action: () => mutate(getArrayRemoveMutations(node, doc)),
    })

    const moveItems: ContextMenuNode[] = []
    const moveUpMutations = getArrayMoveMutations(node, doc, 'previous')
    const moveDownMutations = getArrayMoveMutations(node, doc, 'next')
    const moveFirstMutations = getArrayMoveMutations(node, doc, 'first')
    const moveLastMutations = getArrayMoveMutations(node, doc, 'last')

    if (moveFirstMutations) {
      moveItems.push({
        type: 'action',
        label: 'To top',
        icon: PublishIcon,
        action: () => mutate(moveFirstMutations),
      })
    }
    if (moveUpMutations) {
      moveItems.push({
        type: 'action',
        label: 'Up',
        icon: ArrowUpIcon,
        action: () => mutate(moveUpMutations),
      })
    }

    if (moveDownMutations) {
      moveItems.push({
        type: 'action',
        label: 'Down',
        icon: ArrowDownIcon,
        action: () => mutate(moveDownMutations),
      })
    }
    if (moveLastMutations) {
      moveItems.push({
        type: 'action',
        label: 'To bottom',
        icon: UnpublishIcon,
        action: () => mutate(moveLastMutations),
      })
    }
    if (moveItems.length > 0) {
      items.push({
        type: 'group',
        label: 'Move',
        icon: SortIcon,
        items: moveItems,
      })
      items.push({type: 'divider'})
    }
  }

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
          mutate(mutations, {commit: true})
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
          mutate(mutations, {commit: true})
        },
      }
    }),
  })

  return items
}
