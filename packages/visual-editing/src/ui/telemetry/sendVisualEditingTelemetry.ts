import {defineEvent} from '@sanity/telemetry'
import type {VisualEditingNode} from '../../types'

const events = {
  'Drag Sequence Complete': defineEvent({
    name: 'Drag Sequence Complete',
    description: 'An array is successfully reordered using drag and drop.',
    version: 1,
  }),
}

type EventDataMap = {
  [K in keyof typeof events]: (typeof events)[K] extends ReturnType<typeof defineEvent<infer T>>
    ? T
    : never
}

function sendVisualEditingTelemetry<K extends keyof typeof events>(
  name: K,
  data: EventDataMap[K] extends void ? null | undefined : EventDataMap[K],
  comlink: VisualEditingNode | undefined,
) {
  if (!comlink) return

  const event = events[name]

  if (!event) {
    throw new Error(`Telemetry event: ${name} does not exist`)
  } else {
    comlink.post('visual-editing/telemetry-log', {event, data})
  }
}

export {sendVisualEditingTelemetry}
