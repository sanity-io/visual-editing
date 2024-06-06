import {SearchIcon, ThLargeIcon, UlistIcon} from '@sanity/icons'
import {type SchemaType} from '@sanity/types'
import {
  Box,
  Button,
  Flex,
  Grid,
  Menu,
  MenuItem,
  type MenuItemProps,
  Stack,
  Tab,
  TabList,
  Text,
  TextInput,
  Tooltip,
} from '@sanity/ui'
import {type ChangeEvent, createElement, useReducer, useState} from 'react'
import {isValidElementType} from 'react-is'

import {getSchemaTypeIcon} from './getSchemaTypeIcon'
import type {InsertMenuOptions} from './InsertMenuOptions'

type InsertMenuGroup = NonNullable<InsertMenuOptions['groups']>[number] & {selected: boolean}
type InsertMenuViews = NonNullable<InsertMenuOptions['views']>
type InsertMenuView = InsertMenuViews[number]

type InsertMenuEvent =
  | {type: 'toggle view'; name: InsertMenuView}
  | {type: 'change query'; query: string}
  | {type: 'select group'; name: string | undefined}

type InsertMenuState = {
  query: string
  groups: Array<InsertMenuGroup>
  views: Array<{name: InsertMenuViews[number]; selected: boolean}>
}

function fullInsertMenuReducer(state: InsertMenuState, event: InsertMenuEvent): InsertMenuState {
  return {
    query: event.type === 'change query' ? event.query : state.query,
    groups:
      event.type === 'select group'
        ? state.groups.map((group) => ({...group, selected: event.name === group.name}))
        : state.groups,
    views:
      event.type === 'toggle view'
        ? state.views.map((view) => ({...view, selected: event.name === view.name}))
        : state.views,
  }
}

const ALL_ITEMS_GROUP_NAME = 'all-items'

const viewContainer = {
  grid: {
    component: Grid,
    props: {autoRows: 'max', columns: 3, gap: 1},
  },
  list: {
    component: Stack,
    props: {space: 1},
  },
} as const

/** @alpha */
export type InsertMenuProps = InsertMenuOptions & {
  schemaTypes: Array<SchemaType>
  onSelect: (schemaType: SchemaType) => void
  labels: {
    'insert-menu.filter.all-items': string
    'insert-menu.search.no-results': string
    'insert-menu.search.placeholder': string
    'insert-menu.toggle-grid-view.tooltip': string
    'insert-menu.toggle-list-view.tooltip': string
  }
}

/** @alpha */
export function InsertMenu(props: InsertMenuProps): React.JSX.Element {
  const showIcons = props.icons === undefined ? true : props.icons
  const [state, send] = useReducer(fullInsertMenuReducer, {
    query: '',
    groups: props.groups
      ? [
          {
            name: ALL_ITEMS_GROUP_NAME,
            title: props.labels['insert-menu.filter.all-items'],
            selected: true,
          },
          ...props.groups.map((group) => ({...group, selected: false})),
        ]
      : [],
    views: (props.views ?? ['list']).map((name, index) => ({name, selected: index === 0})),
  })
  const filteredSchemaTypes = filterSchemaTypes(props.schemaTypes, state.query, state.groups)
  const selectedView = state.views.find((view) => view.selected)?.name ?? 'list'
  const {component: ViewContainer, props: viewContainerProps} = viewContainer[selectedView]

  return (
    <Menu padding={0}>
      <Flex direction="column" height="fill">
        <Flex flex="none" align="center" paddingX={1} gap={1}>
          {props.filter ? (
            <Box flex={1} paddingTop={1}>
              <TextInput
                autoFocus
                fontSize={1}
                icon={SearchIcon}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  send({type: 'change query', query: event.target.value})
                }}
                placeholder={props.labels['insert-menu.search.placeholder']}
                value={state.query}
              />
            </Box>
          ) : null}
          {state.views.length > 1 ? (
            <Box flex="none">
              <ViewToggle
                views={state.views}
                onToggle={(name) => {
                  send({type: 'toggle view', name})
                }}
                labels={props.labels}
              />
            </Box>
          ) : null}
        </Flex>
        <Box padding={1}>
          {state.groups && state.groups.length > 0 ? (
            <TabList paddingY={1} space={1}>
              {state.groups.map((group) => (
                <Tab
                  id={`${group.name}-tab`}
                  aria-controls={`${group.name}-panel`}
                  key={group.name}
                  label={group.title ?? group.name}
                  selected={group.selected}
                  onClick={() => {
                    send({type: 'select group', name: group.name})
                  }}
                />
              ))}
            </TabList>
          ) : null}
          {filteredSchemaTypes.length === 0 ? (
            <Box padding={3}>
              <Text align="center" muted size={1}>
                {props.labels['insert-menu.search.no-results']}
              </Text>
            </Box>
          ) : (
            <ViewContainer flex={1} {...viewContainerProps}>
              {filteredSchemaTypes.map((schemaType) =>
                selectedView === 'grid' ? (
                  <GridMenuItem
                    key={schemaType.name}
                    icon={showIcons ? getSchemaTypeIcon(schemaType) : undefined}
                    onClick={() => {
                      props.onSelect(schemaType)
                    }}
                    schemaType={schemaType}
                  />
                ) : (
                  <MenuItem
                    key={schemaType.name}
                    icon={showIcons ? getSchemaTypeIcon(schemaType) : undefined}
                    onClick={() => {
                      props.onSelect(schemaType)
                    }}
                    text={schemaType.title ?? schemaType.name}
                  />
                ),
              )}
            </ViewContainer>
          )}
        </Box>
      </Flex>
    </Menu>
  )
}

const viewToggleIcon: Record<InsertMenuViews[number], React.ElementType> = {
  grid: ThLargeIcon,
  list: UlistIcon,
}

const viewToggleTooltip: Record<InsertMenuViews[number], keyof ViewToggleProps['labels']> = {
  grid: 'insert-menu.toggle-grid-view.tooltip',
  list: 'insert-menu.toggle-list-view.tooltip',
}

type ViewToggleProps = {
  views: InsertMenuState['views']
  onToggle: (viewName: InsertMenuViews[number]) => void
  labels: Pick<
    InsertMenuProps['labels'],
    'insert-menu.toggle-grid-view.tooltip' | 'insert-menu.toggle-list-view.tooltip'
  >
}

function ViewToggle(props: ViewToggleProps) {
  const viewIndex = props.views.findIndex((view) => view.selected)
  const nextView = props.views[viewIndex + 1] ?? props.views[0]

  return (
    <Tooltip content={viewToggleTooltip[nextView.name]} portal>
      <Button
        mode="bleed"
        icon={viewToggleIcon[nextView.name]}
        onClick={() => {
          props.onToggle(nextView.name)
        }}
      />
    </Tooltip>
  )
}

type GridMenuItemProps = {
  onClick: () => void
  schemaType: SchemaType
  icon: MenuItemProps['icon']
}

function GridMenuItem(props: GridMenuItemProps) {
  const [failedToLoad, setFailedToLoad] = useState(false)

  return (
    <MenuItem padding={0} onClick={props.onClick}>
      <Flex direction="column" gap={3} padding={2}>
        <Box
          flex="none"
          style={{
            backgroundColor: 'var(--card-muted-bg-color)',
            paddingBottom: '66.6%',
            position: 'relative',
          }}
        >
          {isValidElementType(props.icon)
            ? createElement(props.icon, {
                style: {
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translateX(-50%) translateY(-50%)',
                },
              })
            : null}
          {failedToLoad ? null : (
            <img
              src={`/static/preview-${props.schemaType.name}.png`}
              style={{
                objectFit: 'contain',
                width: '100%',
                height: '100%',
                position: 'absolute',
                inset: 0,
              }}
              onError={() => {
                setFailedToLoad(true)
              }}
            />
          )}
        </Box>
        <Box flex={1}>
          <Text size={1} weight="medium">
            {props.schemaType.title ?? props.schemaType.name}
          </Text>
        </Box>
      </Flex>
    </MenuItem>
  )
}

function filterSchemaTypes(
  schemaTypes: Array<SchemaType>,
  query: string,
  groups: Array<InsertMenuGroup>,
) {
  return schemaTypes.filter(
    (schemaType) => passesGroupFilter(schemaType, groups) && passesQueryFilter(schemaType, query),
  )
}

function passesQueryFilter(schemaType: SchemaType, query: string) {
  const sanitizedQuery = query.trim().toLowerCase()

  return schemaType.title
    ? schemaType.title?.toLowerCase().includes(sanitizedQuery)
    : schemaType.name.includes(sanitizedQuery)
}

function passesGroupFilter(schemaType: SchemaType, groups: Array<InsertMenuGroup>) {
  const selectedGroup = groups.find((group) => group.selected)

  return selectedGroup
    ? selectedGroup.name === ALL_ITEMS_GROUP_NAME
      ? true
      : selectedGroup.of?.includes(schemaType.name)
    : true
}
