import {defineEvent} from '@sanity/telemetry'
import {createContext} from 'react'

export const events = {
  'Visual Editing Drag Sequence Completed': defineEvent({
    name: 'Visual Editing Drag Sequence Completed',
    description: 'An array is successfully reordered using drag and drop.',
    version: 1,
  }),
  'Visual Editing Context Menu Item Removed': defineEvent({
    name: 'Visual Editing Context Menu Item Removed',
    description: 'An item is removed using the Context Menu.',
    version: 1,
  }),
}

type EventDataMap = {
  [K in keyof typeof events]: (typeof events)[K] extends ReturnType<typeof defineEvent<infer T>>
    ? T
    : never
}

export type TelemetryContextValue = <K extends keyof typeof events>(
  name: K,
  data: EventDataMap[K] extends void ? null | undefined : EventDataMap[K],
) => void

export const TelemetryContext = createContext<TelemetryContextValue | undefined>(undefined)
