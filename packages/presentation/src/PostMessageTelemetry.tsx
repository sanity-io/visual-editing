import {useTelemetry} from '@sanity/telemetry/react'
import {memo, useEffect, type FC} from 'react'
import type {VisualEditingConnection} from './types'

export interface PostMessageTelemetryProps {
  comlink: VisualEditingConnection
}

const PostMessageDocumentVersions: FC<PostMessageTelemetryProps> = (props) => {
  const {comlink} = props

  const telemetry = useTelemetry()

  useEffect(() => {
    const isDev = process.env['NODE_ENV'] === 'development'
    const debugTelemetry = process.env['SANITY_STUDIO_PRESENTATION_DEBUG_TELEMETRY'] === 'true'

    return comlink.on('visual-editing/telemetry-log', async (message) => {
      const {event, data} = message

      if (!isDev) {
        if (data) {
          telemetry.log(event, data)
        } else {
          telemetry.log(event)
        }
      } else if (debugTelemetry) {
        console.log('Telemetry debug:', {event, data})
      }
    })
  }, [comlink, telemetry])

  return null
}
export default memo(PostMessageDocumentVersions)
