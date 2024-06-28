import type {SchemaUnionNode} from '@repo/visual-editing-helpers'
import {AddIcon} from '@sanity/icons'
import type {SchemaType} from '@sanity/types'
import {Button, Flex} from '@sanity/ui'
import {type FunctionComponent, type MouseEvent, useCallback, useRef, useState} from 'react'
import styled, {type CSSObject} from 'styled-components'

import {getNodeIcon} from './getNodeIcon'
import {InsertMenu} from './InsertMenu'

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

const Root = styled(Flex)<{$position?: 'top' | 'bottom'}>((props: {
  $position?: 'top' | 'bottom'
}) => {
  const {$position} = props
  return [
    {
      pointerEvents: 'all',
      top: $position === 'top' ? 0 : undefined,
      bottom: $position === 'bottom' ? 0 : undefined,
      height: '40px',
      left: 0,
      position: 'absolute',
      width: '100%',
    },
  ]
})

export const HoverZone: FunctionComponent<{
  node: SchemaUnionNode
  onAddUnion?: (position: 'top' | 'bottom', name: string) => void
  onBubbledEvent: (e: MouseEvent) => void
  position?: 'top' | 'bottom'
}> = ({onBubbledEvent, node, onAddUnion, position}) => {
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
    <Root
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
          onDismiss={dismissPortal}
          referenceElement={referenceElement}
          filter={true}
          groups={[
            {
              name: 'intro',
              title: 'Intro',
              of: ['hero', 'intro'],
            },
            {
              name: 'features',
              title: 'Features',
              of: ['featuredProducts', 'featureHighlight'],
            },
            {
              name: 'pages',
              title: 'Pages',
              of: ['section'],
            },
          ]}
          views={[
            {name: 'list'},
            {
              name: 'grid',
              previewImageUrl: (name) => `/static/preview-${name}.png`,
            },
          ]}
          // @ts-expect-error -- TODO map typings
          schemaTypes={node.of.map((type) => ({
            ...type,
            icon: getNodeIcon(type),
          }))}
          onSelect={onSelect}
        />
      )}
    </Root>
  )
}
