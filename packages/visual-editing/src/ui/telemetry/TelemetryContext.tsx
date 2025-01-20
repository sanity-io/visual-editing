import {defineEvent} from '@sanity/telemetry'
import {createContext} from 'react'

export const events = {
  'Visual Editing Drag Sequence Completed': defineEvent({
    name: 'Visual Editing Drag Sequence Completed',
    description: 'An array is successfully reordered using drag and drop.',
    version: 1,
  }),
  'Visual Editing Drag Minimap Enabled': defineEvent({
    name: 'Visual Editing Drag Minimap Enabled',
    description: 'The zoomed-out minimap view is enabled during a drag sequence.',
    version: 1,
  }),
  'Visual Editing Context Menu Item Removed': defineEvent({
    name: 'Visual Editing Context Menu Item Removed',
    description: 'An item is removed using the Context Menu.',
    version: 1,
  }),
  'Visual Editing Context Menu Item Duplicated': defineEvent({
    name: 'Visual Editing Context Menu Item Duplicated',
    description: 'An item is duplicated using the Context Menu.',
    version: 1,
  }),
  'Visual Editing Context Menu Item Moved': defineEvent({
    name: 'Visual Editing Context Menu Item Moved',
    description: 'An item is moved using the Context Menu.',
    version: 1,
  }),
  'Visual Editing Context Menu Item Inserted': defineEvent({
    name: 'Visual Editing Context Menu Item Inserted',
    description: 'An item is inserted using the Context Menu.',
    version: 1,
  }),
  'Visual Editing Insert Menu Item Inserted': defineEvent({
    name: 'Visual Editing Insert Menu Item Inserted',
    description: 'An item is inserted using the Insert Menu.',
    version: 1,
  }),
  'Visual Editing Overlay Clicked': defineEvent({
    name: 'Visual Editing Overlay Clicked',
    description: 'An Overlay is clicked.',
    version: 1,
  }),
}

type EventDataMap = {
  [K in keyof typeof events]: (typeof events)[K] extends ReturnType<typeof defineEvent<infer T>>
    ? T
    : never
}

export type TelemetryEventNames = keyof typeof events

export type TelemetryContextValue = <K extends keyof typeof events>(
  name: K,
  data: EventDataMap[K] extends void ? null | undefined : EventDataMap[K],
) => void

export const TelemetryContext = createContext<TelemetryContextValue | undefined>(undefined)
