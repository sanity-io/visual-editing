import {
  InsertMenu as SanityInsertMenu,
  type InsertMenuProps as SanityInsertMenuProps,
} from '@sanity/insert-menu'
import {Flex, Popover} from '@sanity/ui'
import {type FunctionComponent} from 'react'
import {styled} from 'styled-components'

import {PopoverPortal} from './PopoverPortal'

const labels = {
  'insert-menu.filter.all-items': 'All',
  'insert-menu.search.no-results': 'No results',
  'insert-menu.search.placeholder': 'Filter types…',
  'insert-menu.toggle-grid-view.tooltip': 'Toggle grid view',
  'insert-menu.toggle-list-view.tooltip': 'Toggle list view',
} as const

const PointerEventsWrapper = styled(Flex)`
  pointer-events: all;
`

interface InsertMenuProps extends Omit<SanityInsertMenuProps, 'labels'> {
  onDismiss: () => void
  referenceElement: HTMLElement
  labels?: SanityInsertMenuProps['labels']
}

export const InsertMenu: FunctionComponent<InsertMenuProps> = (props) => {
  const {onDismiss, referenceElement, ...insertMenuProps} = props

  const popoverContent = (
    <PointerEventsWrapper data-sanity-overlay-element flex={1} width={2}>
      <SanityInsertMenu labels={labels} {...insertMenuProps} />
    </PointerEventsWrapper>
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
