import {
  Box,
  Flex,
  Menu,
  MenuDivider,
  MenuGroup,
  MenuItem,
  Popover,
  Spinner,
  Stack,
  Text,
  type PopoverMargins,
} from '@sanity/ui/_visual-editing'
import {useCallback, useEffect, useMemo, useState, type FunctionComponent} from 'react'
import {useDocuments} from '../../react/useDocuments'
import type {ContextMenuNode, ContextMenuProps} from '../../types'
import {getNodeIcon} from '../../util/getNodeIcon'
import {PopoverPortal} from '../PopoverPortal'
import {useSchema} from '../schema/useSchema'
import {useTelemetry} from '../telemetry/useTelemetry'
import {getContextMenuItems} from './contextMenuItems'

const POPOVER_MARGINS: PopoverMargins = [-4, 4, -4, 4]

function ContextMenuItem(props: {
  node: ContextMenuNode
  onDismiss?: () => void
  boundaryElement: HTMLDivElement | null
}) {
  const {node, onDismiss, boundaryElement} = props
  const sendTelemetry = useTelemetry()

  const onClick = useCallback(() => {
    if (node.type === 'action') {
      node.action?.()
      onDismiss?.()

      if (node.telemetryEvent) {
        sendTelemetry(node.telemetryEvent, null)
      }
    }
  }, [node, onDismiss, sendTelemetry])

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
        onClick={onClick}
      />
    )
  }

  if (node.type === 'group') {
    return (
      <MenuGroup
        fontSize={1}
        icon={node.icon}
        padding={2}
        // @todo when this PR lands https://github.com/sanity-io/ui/pull/1454
        // menu={{
        //   padding: 0,
        // }}
        popover={{
          arrow: false,
          constrainSize: true,
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
          __unstable_margins: POPOVER_MARGINS,
        }}
        space={2}
        text={node.label}
      >
        {node.items.map((item, itemIndex) => (
          <ContextMenuItem
            key={itemIndex}
            node={item}
            onDismiss={onDismiss}
            boundaryElement={boundaryElement}
          />
        ))}
      </MenuGroup>
    )
  }

  if (node.type === 'custom') {
    const {component: Component} = node
    return <Component boundaryElement={boundaryElement} sendTelemetry={sendTelemetry} />
  }

  return null
}

export const ContextMenu: FunctionComponent<ContextMenuProps> = (props) => {
  const {
    node,
    onDismiss,
    position: {x, y},
  } = props

  const [boundaryElement, setBoundaryElement] = useState<HTMLDivElement | null>(null)

  const {getField} = useSchema()
  const {getDocument} = useDocuments()

  const {field, parent} = getField(node)

  const title = useMemo(() => {
    return field?.title || field?.name || 'Unknown type'
  }, [field])

  const [items, setItems] = useState<ContextMenuNode[] | undefined>(undefined)

  useEffect(() => {
    const fetchContextMenuItems = async () => {
      const doc = getDocument(node.id)
      if (!doc) return
      const items = await getContextMenuItems({node, field, parent, doc})
      setItems(items)
    }
    fetchContextMenuItems()
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

  const icon = useMemo(() => {
    return getNodeIcon(field)
  }, [field])

  return (
    <PopoverPortal setBoundaryElement={setBoundaryElement} onDismiss={onDismiss}>
      <Popover
        __unstable_margins={POPOVER_MARGINS}
        arrow={false}
        open
        placement="right-start"
        referenceElement={contextMenuReferenceElement}
        content={
          <Menu style={{minWidth: 120, maxWidth: 160}}>
            <Flex gap={2} padding={2}>
              <Box flex="none">{items ? <Text size={1}>{icon}</Text> : <Spinner size={1} />}</Box>

              <Stack flex={1} space={2}>
                <Text size={1} weight="semibold">
                  {items ? title : 'Loading...'}
                </Text>
              </Stack>
            </Flex>

            {items && (
              <>
                <MenuDivider />
                {items.map((item, i) => (
                  <ContextMenuItem
                    key={i}
                    node={item}
                    onDismiss={onDismiss}
                    boundaryElement={boundaryElement}
                  />
                ))}
              </>
            )}
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
