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
    return comlink.on('visual-editing/telemetry', async (data) => {
      const {method = 'log'} = data
      console.log(data)
      switch (method) {
        case 'log':
          console.log(telemetry)
          break
        default:
          console.warn(`Invalid telemetry method requested: ${data.method}`)
      }
    })
  }, [comlink, telemetry])

  return null
}
export default memo(PostMessageDocumentVersions)
