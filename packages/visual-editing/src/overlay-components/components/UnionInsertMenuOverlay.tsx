import type {SchemaNode, SchemaUnionNode} from '@repo/visual-editing-helpers'
import {AddIcon} from '@sanity/icons'
import type {SchemaType} from '@sanity/types'
import {Button, Flex} from '@sanity/ui'
import {useCallback, useRef, useState, type FunctionComponent, type MouseEvent} from 'react'
import styled from 'styled-components'
import type {ElementNode, OverlayComponent} from '../../types'
import {useDocuments} from '../../ui/optimistic-state/useDocuments'
import {getArrayInsertPatches} from '../../util/mutations'
import {InsertMenu} from './InsertMenu'

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
  top: var(--hover-area-top);
  right: var(--hover-area-right);
  bottom: var(--hover-area-bottom);
  left: var(--hover-area-left);
  height: var(--hover-area-height);
  position: absolute;
  width: var(--hover-area-width);

  --hover-area-top: auto;
  --hover-area-right: auto;
  --hover-area-bottom: auto;
  --hover-area-left: auto;
  --hover-area-height: 100%;
  --hover-area-width: 100%;
  &[data-position='top'] {
    --hover-area-top: 0;
    --hover-area-height: 40px;
  }
  &[data-position='right'] {
    --hover-area-right: 0;
    --hover-area-width: 40px;
  }
  &[data-position='bottom'] {
    --hover-area-bottom: 0;
    --hover-area-height: 40px;
  }
  &[data-position='left'] {
    --hover-area-left: 0;
    --hover-area-width: 40px;
  }
`

const HoverArea: FunctionComponent<{
  element: ElementNode
  node: SchemaUnionNode
  onAddUnion: (position: 'top' | 'right' | 'bottom' | 'left', name: string) => void
  position: 'top' | 'right' | 'bottom' | 'left'
}> = (props) => {
  const {element, node, onAddUnion, position} = props
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
      onAddUnion(position, schemaType.name)
    },
    [onAddUnion, position],
  )

  const align = position === 'top' ? 'flex-start' : position === 'bottom' ? 'flex-end' : 'center'
  const justify = position === 'left' ? 'flex-start' : position === 'right' ? 'flex-end' : 'center'

  return (
    <HoverAreaRoot
      data-position={position}
      data-sanity-overlay-element
      align={align}
      justify={justify}
      onClick={bubbleEvent}
      onContextMenu={bubbleEvent}
      onMouseDown={bubbleEvent}
      onMouseUp={bubbleEvent}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      ref={ref}
    >
      {(showButton || menuVisible) && (
        <AddButton
          ref={setReferenceElement}
          icon={AddIcon}
          mode={'ghost'}
          onClick={() => {
            setMenuVisible((visible) => !visible)
          }}
          radius={'full'}
          selected={menuVisible}
          size={3}
        />
      )}
      {menuVisible && referenceElement && (
        <InsertMenu
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
  {direction: 'horizontal' | 'vertical'},
  SchemaUnionNode<SchemaNode>
> = (props) => {
  const {element, direction, node, parent} = props

  const {getDocument} = useDocuments()

  const onAddUnion = useCallback(
    (position: 'top' | 'right' | 'bottom' | 'left', name: string) => {
      const doc = getDocument(node.id)
      const insertPosition = position === 'top' || position === 'left' ? 'before' : 'after'
      const patches = getArrayInsertPatches(node, name, insertPosition)
      doc.patch(patches)
    },
    [getDocument, node],
  )

  return (
    <>
      <HoverArea
        element={element}
        node={parent}
        onAddUnion={onAddUnion}
        position={direction === 'horizontal' ? 'left' : 'top'}
      />
      <HoverArea
        element={element}
        node={parent}
        onAddUnion={onAddUnion}
        position={direction === 'horizontal' ? 'right' : 'bottom'}
      />
    </>
  )
}

export default UnionInsertMenuOverlay
