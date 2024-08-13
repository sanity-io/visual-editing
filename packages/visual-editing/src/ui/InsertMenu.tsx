import type {SchemaUnionNode} from '@repo/visual-editing-helpers'
import type {InsertMenuOptions} from '@sanity/insert-menu'
import {InsertMenu as SanityInsertMenu} from '@sanity/insert-menu'
import type {SchemaType} from '@sanity/types'
import {Flex, Popover} from '@sanity/ui'
import {type FunctionComponent} from 'react'

import {getNodeIcon} from '../util/getNodeIcon'
import {PopoverPortal} from './PopoverPortal'

const labels = {
  'insert-menu.filter.all-items': 'All',
  'insert-menu.search.no-results': 'No results',
  'insert-menu.search.placeholder': 'Filter types…',
  'insert-menu.toggle-grid-view.tooltip': 'Toggle grid view',
  'insert-menu.toggle-list-view.tooltip': 'Toggle list view',
} as const

interface InsertMenuProps {
  node: SchemaUnionNode
  onDismiss: () => void
  onSelect: (schemaType: SchemaType) => void
  referenceElement: HTMLElement
}

export const InsertMenu: FunctionComponent<InsertMenuProps> = (props) => {
  const {node, onDismiss, onSelect, referenceElement} = props

  const insertMenuOptions = node.options?.insertMenu || {}

  const views = insertMenuOptions.views?.map((view) => {
    // Map the `previewImageUrls` that Presentation already resolved and
    // serialized back to a function so that InsertMenu can "resolve" them
    if (view.name === 'grid') {
      return {
        name: 'grid',
        previewImageUrl: (name) => view.previewImageUrls?.[name],
      }
    }
    return view
  }) satisfies InsertMenuOptions['views']

  const popoverContent = (
    <Flex flex={1} width={2}>
      <SanityInsertMenu
        {...insertMenuOptions}
        labels={labels}
        // @ts-expect-error -- @todo map typings
        schemaTypes={node.of.map((type) => ({
          ...type,
          icon: getNodeIcon(type),
        }))}
        onSelect={onSelect}
        views={views}
      />
    </Flex>
  )

  return (
    <PopoverPortal onDismiss={onDismiss}>
      <Popover
        animate={true}
        constrainSize
        fallbackPlacements={['bottom']}
        open
        placement={'top'}
        referenceElement={referenceElement}
        content={popoverContent}
      />
    </PopoverPortal>
  )
}
