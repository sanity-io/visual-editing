import {defineEvent} from '@sanity/telemetry'
import type {VisualEditingNode} from '../../types'

const events = {
  'Visual Editing Drag Sequence Completed': defineEvent({
    name: 'Visual Editing Drag Sequence Completed',
    description: 'An array is successfully reordered using drag and drop.',
    version: 1,
  }),
}

type EventDataMap = {
  [K in keyof typeof events]: (typeof events)[K] extends ReturnType<typeof defineEvent<infer T>>
    ? T
    : never
}

function sendTelemetry<K extends keyof typeof events>(
  name: K,
  data: EventDataMap[K] extends void ? null | undefined : EventDataMap[K],
  comlink: VisualEditingNode | undefined,
): void {
  if (!comlink) return

  const event = events[name]

  if (!event) {
    throw new Error(`Telemetry event: ${name} does not exist`)
  } else {
    comlink.post('visual-editing/telemetry-log', {event, data})
  }
}

export {sendTelemetry}
