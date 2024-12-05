import {useTelemetry} from '@sanity/telemetry/react'
import {memo, useEffect, type FC} from 'react'
import type {VisualEditingConnection} from './types'

export interface PostMessageTelemetryProps {
  comlink: VisualEditingConnection
}

const PostMessageTelemetry: FC<PostMessageTelemetryProps> = (props) => {
  const {comlink} = props

  const telemetry = useTelemetry()

  useEffect(() => {
    return comlink.on('visual-editing/telemetry-log', async (message) => {
      const {event, data} = message

      data ? telemetry.log(event, data) : telemetry.log(event)
    })
  }, [comlink, telemetry])

  return null
}
export default memo(PostMessageTelemetry)
