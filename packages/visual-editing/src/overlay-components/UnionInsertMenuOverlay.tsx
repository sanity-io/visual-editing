import type {SchemaNode, SchemaUnionNode} from '@repo/visual-editing-helpers'
import {AddIcon} from '@sanity/icons'
import type {SchemaType} from '@sanity/types'
import {Button, Flex} from '@sanity/ui'
import {useCallback, useRef, useState, type FunctionComponent, type MouseEvent} from 'react'
import styled from 'styled-components'
import type {ElementNode, OverlayComponent} from '../types'
import {useDocuments} from '../ui/optimistic-state/useDocuments'
import {getArrayInsertPatches} from '../util/mutations'
import {InsertMenu} from './InsertMenu'

const AddButton = styled(Button)`
  position: relative;

  transform: var(--add-button-position);

  --add-button-position: translateY(0);
  [data-position='top'] & {
    --add-button-position: translateY(-50%);
  }
  [data-position='bottom'] & {
    --add-button-position: translateY(50%);
  }
`
const HoverAreaRoot = styled(Flex)`
  pointer-events: all;
  top: var(--hover-area-top);
  bottom: var(--hover-area-bottom);
  height: 40px; // @todo not fixed height
  left: 0;
  position: absolute;
  width: 100%;

  --hover-area-top: auto;
  --hover-area-bottom: auto;
  &[data-position='top'] {
    --hover-area-top: 0;
  }
  &[data-position='bottom'] {
    --hover-area-bottom: 0;
  }
`

const HoverArea: FunctionComponent<{
  element: ElementNode
  node: SchemaUnionNode
  onAddUnion: (position: 'top' | 'bottom', name: string) => void
  position: 'top' | 'bottom'
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

  return (
    <HoverAreaRoot
      data-position={position}
      data-sanity-overlay-element
      align={position === 'top' ? 'flex-start' : 'flex-end'}
      justify={'center'}
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

export const UnionInsertMenuOverlay: OverlayComponent<SchemaUnionNode<SchemaNode>> = (props) => {
  const {element, node, parent} = props

  const {getDocument} = useDocuments()

  const onAddUnion = useCallback(
    (position: 'top' | 'bottom', name: string) => {
      const doc = getDocument(node.id)
      const patches = getArrayInsertPatches(node, name, position === 'top' ? 'before' : 'after')
      doc.patch(patches)
    },
    [getDocument, node],
  )

  return (
    <>
      <HoverArea element={element} node={parent} onAddUnion={onAddUnion} position="top" />
      <HoverArea element={element} node={parent} onAddUnion={onAddUnion} position="bottom" />
    </>
  )
}

export default UnionInsertMenuOverlay
