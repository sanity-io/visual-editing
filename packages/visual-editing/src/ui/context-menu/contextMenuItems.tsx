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
import type {
  SanityNode,
  SchemaArrayItem,
  SchemaNode,
  SchemaUnionNode,
  SchemaUnionOption,
} from '@sanity/presentation-comlink'
import type {SchemaType} from '@sanity/types'
import {MenuGroup} from '@sanity/ui/_visual-editing'
import {type FunctionComponent} from 'react'
import type {OptimisticDocument} from '../../optimistic'
import {InsertMenu} from '../../overlay-components/components/InsertMenu'
import type {ContextMenuNode, OverlayElementField, OverlayElementParent} from '../../types'
import {getNodeIcon} from '../../util/getNodeIcon'
import {
  getArrayDuplicatePatches,
  getArrayInsertPatches,
  getArrayMovePatches,
  getArrayRemovePatches,
} from '../../util/mutations'

export function getArrayRemoveAction(node: SanityNode, doc: OptimisticDocument): () => void {
  if (!node.type) throw new Error('Node type is missing')
  return () =>
    doc.patch(async ({getSnapshot}) => getArrayRemovePatches(node, (await getSnapshot())!))
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
  return () =>
    doc.patch(async ({getSnapshot}) => getArrayDuplicatePatches(node, (await getSnapshot())!))
}

export function getContextMenuItems(context: {
  doc: OptimisticDocument
  field: OverlayElementField
  node: SanityNode
  parent: OverlayElementParent
}): Promise<ContextMenuNode[]> {
  const {node, field, parent, doc} = context
  if (field?.type === 'arrayItem') {
    return getContextMenuArrayItems({node, field, doc})
  }
  if (parent?.type === 'union') {
    return getContextMenuUnionItems({node, parent, doc})
  }

  return Promise.resolve([])
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
      telemetryEvent: 'Visual Editing Context Menu Item Duplicated' as const,
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
      telemetryEvent: 'Visual Editing Context Menu Item Removed' as const,
    },
  ]
}

async function getMoveItems(
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

  const [moveUpPatches, moveDownPatches, moveFirstPatches, moveLastPatches] = await Promise.all([
    getArrayMovePatches(node, doc, 'previous'),
    getArrayMovePatches(node, doc, 'next'),
    getArrayMovePatches(node, doc, 'first'),
    getArrayMovePatches(node, doc, 'last'),
  ])

  if (moveFirstPatches.length) {
    groupItems.push({
      type: 'action',
      label: 'To top',
      icon: PublishIcon,
      action: () => doc.patch(moveFirstPatches),
      telemetryEvent: 'Visual Editing Context Menu Item Moved',
    })
  }
  if (moveUpPatches.length) {
    groupItems.push({
      type: 'action',
      label: 'Up',
      icon: ArrowUpIcon,
      action: () => doc.patch(moveUpPatches),
      telemetryEvent: 'Visual Editing Context Menu Item Moved',
    })
  }
  if (moveDownPatches.length) {
    groupItems.push({
      type: 'action',
      label: 'Down',
      icon: ArrowDownIcon,
      action: () => doc.patch(moveDownPatches),
      telemetryEvent: 'Visual Editing Context Menu Item Moved',
    })
  }
  if (moveLastPatches.length) {
    groupItems.push({
      type: 'action',
      label: 'To bottom',
      icon: UnpublishIcon,
      action: () => doc.patch(moveLastPatches),
      telemetryEvent: 'Visual Editing Context Menu Item Moved',
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

async function getContextMenuArrayItems(context: {
  doc: OptimisticDocument
  field: SchemaArrayItem
  node: SanityNode
}): Promise<ContextMenuNode[]> {
  const {node, field, doc} = context
  const items: ContextMenuNode[] = []
  items.push(...getDuplicateItem(context))
  items.push(...getRemoveItems(context))
  items.push(...(await getMoveItems(context)))

  items.push({
    type: 'action',
    label: 'Insert before',
    icon: InsertAboveIcon,
    action: getArrayInsertAction(node, doc, field.name, 'before'),
    telemetryEvent: 'Visual Editing Context Menu Item Inserted',
  })
  items.push({
    type: 'action',
    label: 'Insert after',
    icon: InsertBelowIcon,
    action: getArrayInsertAction(node, doc, field.name, 'after'),
    telemetryEvent: 'Visual Editing Context Menu Item Inserted',
  })

  return items
}

const InsertMenuWrapper: FunctionComponent<{
  label: string
  onSelect: (schemaType: SchemaType) => void
  parent: SchemaUnionNode<SchemaNode>
  width: number | undefined
  boundaryElement: HTMLDivElement | null
}> = (props) => {
  const {label, parent, width, onSelect, boundaryElement} = props

  return (
    <MenuGroup
      fontSize={1}
      icon={InsertBelowIcon}
      padding={2}
      popover={{
        arrow: false,
        constrainSize: true,
        floatingBoundary: boundaryElement,
        padding: 0,
        placement: 'right-start',
        fallbackPlacements: [
          'left-start',
          'right',
          'left',
          'right-end',
          'left-end',
          'bottom',
          'top',
        ],
        preventOverflow: true,
        width,
        __unstable_margins: [4, 4, 4, 4],
      }}
      space={2}
      text={label}
    >
      <InsertMenu node={parent} onSelect={onSelect} />
    </MenuGroup>
  )
}

async function getContextMenuUnionItems(context: {
  doc: OptimisticDocument
  node: SanityNode
  parent: SchemaUnionNode<SchemaNode>
}): Promise<ContextMenuNode[]> {
  const {doc, node, parent} = context
  const items: ContextMenuNode[] = []
  items.push(...getDuplicateItem(context))
  items.push(...getRemoveItems(context))
  items.push(...(await getMoveItems(context)))

  if (parent.options?.insertMenu) {
    const insertMenuOptions = parent.options.insertMenu || {}
    const width = insertMenuOptions.views?.some((view) => view.name === 'grid') ? 0 : undefined

    items.push({
      type: 'custom',
      component: ({boundaryElement, sendTelemetry}) => {
        const onSelect = (schemaType: SchemaType) => {
          const action = getArrayInsertAction(node, doc, schemaType.name, 'before')
          action()

          sendTelemetry('Visual Editing Context Menu Item Inserted', null)
        }
        return (
          <InsertMenuWrapper
            label="Insert before"
            onSelect={onSelect}
            parent={parent}
            width={width}
            boundaryElement={boundaryElement}
          />
        )
      },
    })

    items.push({
      type: 'custom',
      component: ({boundaryElement, sendTelemetry}) => {
        const onSelect = (schemaType: SchemaType) => {
          const action = getArrayInsertAction(node, doc, schemaType.name, 'after')
          action()

          sendTelemetry('Visual Editing Context Menu Item Inserted', null)
        }
        return (
          <InsertMenuWrapper
            label="Insert after"
            onSelect={onSelect}
            parent={parent}
            width={width}
            boundaryElement={boundaryElement}
          />
        )
      },
    })
  } else {
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
          telemetryEvent: 'Visual Editing Context Menu Item Inserted',
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
          telemetryEvent: 'Visual Editing Context Menu Item Inserted',
        }
      }),
    })
  }

  return items
}
