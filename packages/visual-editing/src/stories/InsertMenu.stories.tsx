import {CommentIcon} from '@sanity/icons/Comment'
import {DesktopIcon} from '@sanity/icons/Desktop'
import {DocumentVideoIcon} from '@sanity/icons/DocumentVideo'
import {EnvelopeIcon} from '@sanity/icons/Envelope'
import {InfoOutlineIcon} from '@sanity/icons/InfoOutline'
import {SyncIcon} from '@sanity/icons/Sync'
import type {ObjectSchemaType} from '@sanity/types'
import {
  Box,
  Card,
  LayerProvider,
  studioTheme,
  ThemeProvider,
  usePrefersDark,
} from '@sanity/ui/_visual-editing'
import type {Meta, StoryObj} from '@storybook/react'
import {fn} from '@storybook/test'

import {InsertMenu, type InsertMenuProps} from '../ui/insert-menu/InsertMenu'

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
  {name: 'grid', previewImageUrl: () => undefined},
]

interface InsertMenuStoryArgs {
  showIcons: boolean
  filter: 'auto' | 'true' | 'false' | 'undefined'
  groups: boolean
  views: boolean
  onSelect: InsertMenuProps['onSelect']
}

function InsertMenuStory(props: InsertMenuStoryArgs) {
  const prefersDark = usePrefersDark()
  const filter =
    props.filter === 'undefined'
      ? undefined
      : props.filter === 'true'
        ? true
        : props.filter === 'false'
          ? false
          : 'auto'

  return (
    <ThemeProvider scheme={prefersDark ? 'dark' : 'light'} theme={studioTheme}>
      <Box padding={4}>
        <Card radius={3} shadow={3}>
          <LayerProvider>
            <InsertMenu
              showIcons={props.showIcons}
              filter={filter}
              groups={props.groups ? groups : undefined}
              views={props.views ? views : undefined}
              labels={labels}
              onSelect={props.onSelect}
              schemaTypes={schemaTypes}
            />
          </LayerProvider>
        </Card>
      </Box>
    </ThemeProvider>
  )
}

const meta = {
  title: 'Insert menu',
  component: InsertMenuStory,
  args: {
    showIcons: true,
    filter: 'auto',
    groups: true,
    views: true,
    onSelect: fn(),
  },
  argTypes: {
    filter: {
      control: 'select',
      options: ['auto', 'true', 'false', 'undefined'],
    },
  },
} satisfies Meta<typeof InsertMenuStory>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
