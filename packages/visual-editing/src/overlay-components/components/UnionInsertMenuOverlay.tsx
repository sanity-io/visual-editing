import type {SchemaNode, SchemaUnionNode} from '@repo/visual-editing-helpers'
import {AddIcon} from '@sanity/icons'
import type {SchemaType} from '@sanity/types'
import {Button, Flex} from '@sanity/ui'
import {
  useCallback,
  useRef,
  useState,
  type FunctionComponent,
  type HTMLProps,
  type MouseEvent,
} from 'react'
import styled from 'styled-components'
import type {ElementNode, OverlayComponent} from '../../types'
import {useDocuments} from '../../ui/optimistic-state/useDocuments'
import {getArrayInsertPatches} from '../../util/mutations'
import {InsertMenuPopover} from './InsertMenu'

const AddButton = styled(Button)`
  position: relative;
  transform: var(--add-button-position);

  --add-button-position: translateY(0);
  [data-position='top'] & {
    --add-button-position: translateY(-50%);
  }
  [data-position='right'] & {
    --add-button-position: translateX(50%);
  }
  [data-position='bottom'] & {
    --add-button-position: translateY(50%);
  }
  [data-position='left'] & {
    --add-button-position: translateX(-50%);
  }
`
const HoverAreaRoot = styled(Flex)`
  pointer-events: all;
  height: var(--hover-area-height);
  width: var(--hover-area-width);

  --hover-area-height: 100%;
  --hover-area-width: 100%;
  &[data-position='top'],
  &[data-position='bottom'] {
    --hover-area-height: 48px;
  }
  &[data-position='right'],
  &[data-position='left'] {
    --hover-area-width: 48px;
  }
`

const HoverArea: FunctionComponent<{
  element: ElementNode
  hoverAreaExtent: HTMLProps<HTMLDivElement>['height' | 'width']
  node: SchemaUnionNode
  onAddUnion: (insertPosition: 'before' | 'after', name: string) => void
  position: 'top' | 'right' | 'bottom' | 'left'
}> = (props) => {
  const {element, hoverAreaExtent, node, onAddUnion, position} = props
  const [showButton, setShowButton] = useState(false)
  const onEnter = useCallback(() => {
    setShowButton(true)
  }, [])
  const onLeave = useCallback(() => {
    setShowButton(false)
  }, [])
  const ref = useRef<HTMLDivElement | null>(null)

  const bubbleEvent = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (event.target === ref.current) {
        const newEvent = new MouseEvent(event.type, {
          ...event.nativeEvent,
          bubbles: true,
          cancelable: true,
        })
        element.dispatchEvent(newEvent)
      }
    },
    [element],
  )

  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null)

  const [menuVisible, setMenuVisible] = useState(false)

  const dismissPortal = useCallback(() => {
    setMenuVisible(false)
    setShowButton(false)
  }, [])

  const onSelect = useCallback(
    (schemaType: SchemaType) => {
      setMenuVisible(false)
      const insertPosition = position === 'top' || position === 'left' ? 'before' : 'after'
      onAddUnion(insertPosition, schemaType.name)
    },
    [onAddUnion, position],
  )

  const align = position === 'top' ? 'flex-start' : position === 'bottom' ? 'flex-end' : 'center'
  const justify = position === 'left' ? 'flex-start' : position === 'right' ? 'flex-end' : 'center'

  return (
    <HoverAreaRoot
      align={align}
      data-position={position}
      data-sanity-overlay-element
      justify={justify}
      onClick={bubbleEvent}
      onContextMenu={bubbleEvent}
      onMouseDown={bubbleEvent}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onMouseUp={bubbleEvent}
      ref={ref}
      style={{
        [position === 'top' || position === 'bottom' ? 'height' : 'width']: hoverAreaExtent,
      }}
    >
      {(showButton || menuVisible) && (
        <AddButton
          ref={setReferenceElement}
          icon={AddIcon}
          mode={'ghost'}
          onClick={() => setMenuVisible((visible) => !visible)}
          radius={'full'}
          selected={menuVisible}
        />
      )}
      {menuVisible && referenceElement && (
        <InsertMenuPopover
          node={node}
          onDismiss={dismissPortal}
          referenceElement={referenceElement}
          onSelect={onSelect}
        />
      )}
    </HoverAreaRoot>
  )
}

export const UnionInsertMenuOverlay: OverlayComponent<
  {
    direction?: 'horizontal' | 'vertical'
    hoverAreaExtent?: HTMLProps<HTMLDivElement>['height' | 'width']
  },
  SchemaUnionNode<SchemaNode>
> = (props) => {
  const {direction = 'vertical', element, hoverAreaExtent, node, parent} = props

  const {getDocument} = useDocuments()

  const onAddUnion = useCallback(
    (insertPosition: 'before' | 'after', name: string) => {
      const doc = getDocument(node.id)
      const patches = getArrayInsertPatches(node, name, insertPosition)
      doc.patch(patches)
    },
    [getDocument, node],
  )

  if (!parent) return null

  return (
    <Flex
      height="fill"
      width="fill"
      direction={direction === 'horizontal' ? 'row' : 'column'}
      justify="space-between"
    >
      <HoverArea
        element={element}
        hoverAreaExtent={hoverAreaExtent}
        node={parent}
        onAddUnion={onAddUnion}
        position={direction === 'horizontal' ? 'left' : 'top'}
      />
      <HoverArea
        element={element}
        hoverAreaExtent={hoverAreaExtent}
        node={parent}
        onAddUnion={onAddUnion}
        position={direction === 'horizontal' ? 'right' : 'bottom'}
      />
    </Flex>
  )
}

export default UnionInsertMenuOverlay
