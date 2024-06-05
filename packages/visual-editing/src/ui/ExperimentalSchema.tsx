import {type FunctionComponent, useEffect} from 'react'

import type {VisualEditingChannel} from '../types'

/**
 * @internal
 */
export const ExperimentalSchema: FunctionComponent<{
  channel: VisualEditingChannel
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: any
}> = (props) => {
  const {channel, schema} = props

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('ExperimentalSchema', schema, channel)
  }, [channel, schema])

  return null
}
