import {useContext} from 'react'
import {TelemetryContext, type TelemetryContextValue} from './TelemetryContext'

export function useTelemetry(): TelemetryContextValue {
  const context = useContext(TelemetryContext)

  if (!context) {
    throw new Error('Telemetry context is missing')
  }

  return context
}
