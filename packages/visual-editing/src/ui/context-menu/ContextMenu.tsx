import {
  Box,
  Flex,
  Menu,
  MenuDivider,
  MenuGroup,
  MenuItem,
  Popover,
  Stack,
  Text,
  type PopoverMargins,
} from '@sanity/ui'
import {useMemo, type FunctionComponent} from 'react'
import type {ContextMenuNode, ContextMenuProps} from '../../types'
import {getNodeIcon} from '../../util/getNodeIcon'
import {useDocuments} from '../optimistic-state/useDocuments'
import {PopoverPortal} from '../PopoverPortal'
import {getField, getSchemaType} from '../schema/schema'
import {useSchema} from '../schema/useSchema'
import {getContextMenuItems} from './contextMenuItems'

const POPOVER_MARGINS: PopoverMargins = [-4, 4, -4, 4]

function ContextMenuItem(props: {node: ContextMenuNode}) {
  const {node} = props

  if (node.type === 'divider') {
    return <MenuDivider />
  }

  if (node.type === 'action') {
    return (
      <MenuItem
        fontSize={1}
        hotkeys={node.hotkeys}
        icon={node.icon}
        padding={2}
        space={2}
        text={node.label}
        disabled={!node.action}
        onClick={node.action}
      />
    )
  }

  if (node.type === 'group') {
    return (
      <MenuGroup
        fontSize={1}
        icon={node.icon}
        padding={2}
        popover={{
          arrow: false,
          constrainSize: true,
          placement: 'right-start',
          preventOverflow: true,
          __unstable_margins: POPOVER_MARGINS,
        }}
        space={2}
        text={node.label}
      >
        {node.items.map((item, itemIndex) => (
          <ContextMenuItem key={itemIndex} node={item} />
        ))}
      </MenuGroup>
    )
  }
  return null
}

export const ContextMenu: FunctionComponent<ContextMenuProps> = (props) => {
  const {
    node,
    onDismiss,
    position: {x, y},
  } = props

  const {schema, resolvedTypes} = useSchema()
  const {getDocument} = useDocuments()

  const schemaType = getSchemaType(node, schema)
  const {field, parent} = getField(node, schemaType, resolvedTypes)

  const title = useMemo(() => {
    return field?.title || field?.name || 'Unknown type'
  }, [field])

  const Icon = useMemo(() => {
    return getNodeIcon(field)
  }, [field])

  const items = useMemo(() => {
    const doc = getDocument(node.id)
    if (!doc) return []
    return getContextMenuItems({node, field, parent, doc})
  }, [field, node, parent, getDocument])

  const contextMenuReferenceElement = useMemo(() => {
    return {
      getBoundingClientRect: () => ({
        bottom: y,
        left: x,
        right: x,
        top: y,
        width: 0,
        height: 0,
      }),
    } as HTMLElement
  }, [x, y])

  return (
    <PopoverPortal onDismiss={onDismiss}>
      <Popover
        __unstable_margins={POPOVER_MARGINS}
        arrow={false}
        open
        placement="right-start"
        style={{pointerEvents: 'all'}}
        referenceElement={contextMenuReferenceElement}
        content={
          <Menu style={{minWidth: 120, maxWidth: 160}}>
            <Flex gap={2} padding={2}>
              <Box flex="none">
                <Text size={1}>{Icon}</Text>
              </Box>

              <Stack flex={1} space={2}>
                <Text size={1} weight="semibold">
                  {title}
                </Text>
              </Stack>
            </Flex>

            <MenuDivider />

            {items.map((item, i) => (
              <ContextMenuItem key={i} node={item} />
            ))}
          </Menu>
        }
      >
        <div
          key={`${x}-${y}`}
          style={{
            position: 'absolute',
            left: x,
            top: y,
          }}
        />
      </Popover>
    </PopoverPortal>
  )
}
