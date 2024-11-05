import type {SchemaUnionNode} from '@repo/visual-editing-helpers'
import type {InsertMenuOptions} from '@sanity/insert-menu'
import {InsertMenu as SanityInsertMenu} from '@sanity/insert-menu'
import type {SchemaType} from '@sanity/types'
import {Popover} from '@sanity/ui'
import {type FunctionComponent} from 'react'
import {PopoverPortal} from '../../ui/PopoverPortal'
import {getNodeIcon} from '../../util/getNodeIcon'

// @todo How can this be localised?
const labels = {
  'insert-menu.filter.all-items': 'All',
  'insert-menu.search.no-results': 'No results',
  'insert-menu.search.placeholder': 'Filter types…',
  'insert-menu.toggle-grid-view.tooltip': 'Toggle grid view',
  'insert-menu.toggle-list-view.tooltip': 'Toggle list view',
} as const

export interface InsertMenuProps {
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
        ...view,
        previewImageUrl: (name) => view.previewImageUrls?.[name],
      }
    }
    return view
  }) satisfies InsertMenuOptions['views']

  // If the grid view is not enabled, the popover should fit the content. If it
  // is enabled, the popover width needs to be 'forced' to some arbitrary amount
  // to prevent the grid from collapsing to a single column. The '0' size allows
  // for a two column layout
  const width = insertMenuOptions.views?.some((view) => view.name === 'grid') ? 0 : undefined

  const popoverContent = (
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
  )

  return (
    <PopoverPortal onDismiss={onDismiss}>
      <Popover
        animate={true}
        constrainSize
        content={popoverContent}
        fallbackPlacements={['bottom']}
        open
        placement={'top'}
        preventOverflow
        referenceElement={referenceElement}
        width={width}
      />
    </PopoverPortal>
  )
}
