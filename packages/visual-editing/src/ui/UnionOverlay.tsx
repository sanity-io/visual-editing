import type {SanityNode, SchemaNode, SchemaUnionNode} from '@repo/visual-editing-helpers'
import {AddIcon} from '@sanity/icons'
import {insert} from '@sanity/mutate'
import type {SchemaType} from '@sanity/types'
import {Button, Flex} from '@sanity/ui'
import {type FunctionComponent, type MouseEvent, useCallback, useRef, useState} from 'react'
import styled, {type CSSObject} from 'styled-components'

import {InsertMenu} from './InsertMenu'
import {useOptimisticState} from './optimistic-state/useOptimisticState'

const AddButton = styled(Button)<{$position?: 'top' | 'bottom'}>((props: {
  $position?: 'top' | 'bottom'
}) => {
  const styles: CSSObject[] = [{position: 'relative'}]
  if (props.$position === 'top') {
    styles.push({transform: 'translateY(-50%)'})
  }
  if (props.$position === 'bottom') {
    styles.push({transform: 'translateY(50%)'})
  }
  return styles
})

const HoverAreaRoot = styled(Flex)<{$position?: 'top' | 'bottom'}>((props: {
  $position?: 'top' | 'bottom'
}) => {
  const {$position} = props
  return [
    {
      pointerEvents: 'all',
      top: $position === 'top' ? 0 : undefined,
      bottom: $position === 'bottom' ? 0 : undefined,
      height: '40px', // @todo not fixed height
      left: 0,
      position: 'absolute',
      width: '100%',
    },
  ]
})

const HoverArea: FunctionComponent<{
  node: SchemaUnionNode
  onAddUnion?: (position: 'top' | 'bottom', name: string) => void
  onBubbledEvent: (e: MouseEvent) => void
  position?: 'top' | 'bottom'
}> = (props) => {
  const {onBubbledEvent, node, onAddUnion, position} = props
  const [showButton, setShowButton] = useState(false)
  const onEnter = useCallback(() => {
    setShowButton(true)
  }, [])
  const onLeave = useCallback(() => {
    setShowButton(false)
  }, [])
  const ref = useRef<HTMLDivElement | null>(null)
  const bubbleEvent = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (e.target === ref.current) {
        onBubbledEvent(e)
      }
    },
    [onBubbledEvent],
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
      // @ts-expect-error -- TODO map typings
      onAddUnion?.(position, schemaType.name)
    },
    [onAddUnion, position],
  )

  return (
    <HoverAreaRoot
      $position={position}
      align={position === 'top' ? 'flex-start' : 'flex-end'}
      data-sanity-overlay-element
      justify={'center'}
      onClick={bubbleEvent}
      onContextMenu={bubbleEvent}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      ref={ref}
    >
      {(showButton || menuVisible) && (
        <AddButton
          ref={setReferenceElement}
          $position={position}
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

export const UnionOverlay: FunctionComponent<{
  node: SchemaUnionNode<SchemaNode>
  onBubbledEvent: (event: MouseEvent) => void
  sanity: SanityNode
}> = (props) => {
  const {node, onBubbledEvent, sanity} = props

  const {mutate} = useOptimisticState(sanity)

  const onAddUnion = useCallback(
    (position: 'top' | 'bottom', name: string) => {
      if ('path' in sanity) {
        const result = sanity.path.match(/^(.+)\[_key=="(.+)"]$/)
        if (!result) return
        const [, path, _key] = result
        if (_key && path) {
          const patch = insert(
            [{_type: name, _key: Math.random().toString(36).slice(2, 5)}],
            position === 'top' ? 'before' : 'after',
            {_key},
          )
          mutate(patch, {path, commit: true})
        }
      }
    },
    [mutate, sanity],
  )

  return (
    <>
      <HoverArea
        node={node}
        onAddUnion={onAddUnion}
        onBubbledEvent={onBubbledEvent}
        position="top"
      />
      <HoverArea
        node={node}
        onAddUnion={onAddUnion}
        onBubbledEvent={onBubbledEvent}
        position="bottom"
      />
    </>
  )
}
