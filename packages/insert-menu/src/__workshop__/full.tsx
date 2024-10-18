import {
  CommentIcon,
  DesktopIcon,
  DocumentVideoIcon,
  EnvelopeIcon,
  InfoOutlineIcon,
  SyncIcon,
} from '@sanity/icons'
import type {ObjectSchemaType} from '@sanity/types'
import {Box, Card, LayerProvider} from '@sanity/ui'
import {useAction, useSelect} from '@sanity/ui-workshop'
import {InsertMenu, type InsertMenuProps} from '../InsertMenu'

const labels = {
  'insert-menu.filter.all-items': 'All',
  'insert-menu.search.no-results': 'No results',
  'insert-menu.search.placeholder': 'Filter types…',
  'insert-menu.toggle-grid-view.tooltip': 'Toggle grid view',
  'insert-menu.toggle-list-view.tooltip': 'Toggle list view',
} as const

const schemaTypes: ObjectSchemaType[] = [
  {
    jsonType: 'object',
    name: 'hero',
    title: 'Hero',
    icon: DesktopIcon,
    fields: [],
    __experimental_search: [],
  },
  {
    jsonType: 'object',
    name: 'logos',
    title: 'Logos',
    icon: SyncIcon,
    fields: [],
    __experimental_search: [],
  },
  {
    jsonType: 'object',
    name: 'testimonials',
    title: 'Testimonials',
    icon: CommentIcon,
    fields: [],
    __experimental_search: [],
  },
  {
    jsonType: 'object',
    name: 'apropos',
    title: 'Apropos',
    icon: InfoOutlineIcon,
    fields: [],
    __experimental_search: [],
  },
  {
    jsonType: 'object',
    name: 'newsletter',
    title: 'Newsletter',
    icon: EnvelopeIcon,
    fields: [],
    __experimental_search: [],
  },
  {
    jsonType: 'object',
    name: 'videos',
    icon: DocumentVideoIcon,
    fields: [],
    __experimental_search: [],
  },
]

const groups: InsertMenuProps['groups'] = [
  {name: 'foo', of: ['hero']},
  {name: 'bar', of: ['hero']},
]

const views: InsertMenuProps['views'] = [
  {name: 'list'},
  {
    name: 'grid',
    previewImageUrl: (_typeName) => undefined, // `https://prj-page-builder.sanity.dev/preview-${typeName}.png`,
  },
]

export default function FullStory() {
  const iconsEnabled = useSelect('showIcons', {true: true, false: false}, true)
  const filter = useSelect('filter', {
    undefined: 'undefined',
    auto: 'auto',
    true: true,
    false: false,
  })
  const groupsEnabled = useSelect('groups', {true: true, false: false}, true)
  const viewsEnabled = useSelect('views', {true: true, false: false}, true)

  const onSelect = useAction('onSelect')

  return (
    <Box padding={4}>
      <Card radius={3} shadow={3}>
        <LayerProvider>
          <InsertMenu
            showIcons={iconsEnabled}
            filter={filter === 'undefined' ? undefined : filter}
            groups={groupsEnabled ? groups : undefined}
            views={viewsEnabled ? views : undefined}
            labels={labels}
            onSelect={onSelect}
            schemaTypes={schemaTypes}
          />
        </LayerProvider>
      </Card>
    </Box>
  )
}
