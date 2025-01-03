import {useCallback, type FunctionComponent, type PropsWithChildren} from 'react'
import type {VisualEditingNode} from '../../types'
import {events, TelemetryContext, type TelemetryContextValue} from './TelemetryContext'

export const TelemetryProvider: FunctionComponent<
  PropsWithChildren<{comlink?: VisualEditingNode}>
> = ({children, comlink}) => {
  const log = useCallback<TelemetryContextValue>(
    (name, data) => {
      if (!comlink) return

      const event = events[name]

      if (!event) {
        throw new Error(`Telemetry event: ${name} does not exist`)
      } else {
        comlink.post('visual-editing/telemetry-log', {event, data})
      }
    },
    [comlink],
  )

  return <TelemetryContext.Provider value={log}>{children}</TelemetryContext.Provider>
}
